#include <napi.h>
#include <iostream>
#include <memory>
#include <thread>
#include <chrono>

#include "./cpp/timer.hpp"
#include "./cpp/can_comm.h"

using namespace std;

Napi::ThreadSafeFunction tsfn;
std::thread nativeThread;
static Timer timer;
static can_comm can_box_instance(USBCAN_II, CAN_DEV_IDX0);
static boolean loop_flag = true;

#define UDEBUG 1

static void print_buf(const char* _prefix, const uint32_t _id, const uint8_t* _buf, const uint16_t _size)
{
#if defined UDEBUG
	static std::mutex mtx;
	std::lock_guard<std::mutex> guard(mtx);
	printf("%s(0x%X,%d): ", _prefix, (unsigned int)_id, _size);
	for (uint16_t i = 0; i < _size; i++)
		printf("%02X ", _buf[i]);
	printf("\n");
#endif
}

static uint8_t can_receive_callback(uint32_t* const _id, uint8_t* const _buf, const uint8_t _size)
{
	//assert(NULL != _id && NULL != _buf);

	uint8_t size = 0;

	if (0 < (size = can_box_instance.receive(CAN_CHL0, _id, _buf, _size)))
		print_buf("CAN RX", *_id, _buf, size);

	return size;
}


Napi::Boolean StartBox(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  boolean result = false;
  cout << "start box from native." << endl;
  if (can_box_instance.open() == 0) {
    if (can_box_instance.init(CAN_CHL0) == 0) {
      result = true;
    } else {
      cout << "init native error." << endl;
    }
  } else {
    cout << "open native error." << endl;
  } 
  
  std::this_thread::sleep_for(std::chrono::milliseconds(10));
  return Napi::Boolean::New(env, result);
}

Napi::Boolean CloseBox(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  cout << "close box from native." << endl;
  can_box_instance.close();
  std::this_thread::sleep_for(std::chrono::milliseconds(10));
  return Napi::Boolean::New(env, true);
}

Napi::Value SendInfoLoop( const Napi::CallbackInfo& info )
{
  Napi::Env env = info.Env();

  if ( info.Length() < 1 )
  {
    throw Napi::TypeError::New( env, "Expected one arguments" );
  }
  else if ( !info[0].IsFunction() )
  {
    throw Napi::TypeError::New( env, "Expected first arg to be function" );
  }
  //else if ( !info[1].IsNumber() )
  //{
  //  throw Napi::TypeError::New( env, "Expected second arg to be number" );
  //}

  //int count = info[1].As<Napi::Number>().Int32Value();

  // Create a ThreadSafeFunction
  loop_flag = true;
  tsfn = Napi::ThreadSafeFunction::New(
      env,
      info[0].As<Napi::Function>(),  // JavaScript function called asynchronously
      "Resource Name",         // Name
      0,                       // Unlimited queue
      1,                       // Only one thread will use this initially
      []( Napi::Env ) {        // Finalizer used to clean threads up
        nativeThread.join();
      } );

  // Create a native thread
  nativeThread = std::thread( [] {
    auto callback = []( Napi::Env env, Napi::Function jsCallback, const char* value ) {
      // Transform native data into JS data, passing it to the provided 
      // `jsCallback` -- the TSFN's JavaScript function.
      //jsCallback.Call( {Napi::Number::New( env, *value )} );
      jsCallback.Call( {Napi::String::New(env, value)} );
      // We're finished with the data.
    };

    unsigned int size, id;
    unsigned char _buf[8];
    char string_buf[32];
    while(loop_flag)
    {

      if (0 < (size = can_box_instance.receive(CAN_CHL0, &id, _buf, sizeof(_buf)))) {
        cout << "id:" << id << ",data:";
        sprintf(string_buf, "%x, %02x %02x %02x %02x %02x %02x %02x %02x", id,
                _buf[0], _buf[1], _buf[2], _buf[3], _buf[4], _buf[5], _buf[6], _buf[7]);
        napi_status status = tsfn.BlockingCall( string_buf, callback );
        if ( status != napi_ok )
        {
          // Handle error
          cout << "block call failed" << endl;
          break;
        }
        
      } else {
        cout << "recive failed!, size=" << size <<  endl;
        std::this_thread::sleep_for( std::chrono::microseconds(100));
      }
      // Create new data
      //int* value = new int( clock() );

      // Perform a blocking call


      //std::this_thread::sleep_for( std::chrono::seconds( 1 ) );
    }

    // Release the thread-safe function
    tsfn.Release();
  } );

  return Napi::Boolean::New(env, true);
}

Napi::Boolean StopSendInfoLoop(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  cout << "close box from native." << endl;
  loop_flag = false;
  std::this_thread::sleep_for(std::chrono::milliseconds(10));
  return Napi::Boolean::New(env, true);
}


Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("startBox", Napi::Function::New(env, StartBox));
  exports.Set("sendInfoLoop", Napi::Function::New(env, SendInfoLoop));
  exports.Set("closeBox", Napi::Function::New(env, CloseBox));
  exports.Set("stopSendInfoLoop", Napi::Function::New(env, StopSendInfoLoop));
  return exports;
}

NODE_API_MODULE(canbox, Init)
