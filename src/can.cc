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
  cout << "end the receive thread" << endl;
  loop_flag = false;
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

Napi::Boolean SendCanBuffer(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  cout << "send canbuf from native." << endl;
  if ( info.Length() < 2 ) {
    cout << "arguments error: ";
    cout << info.Length() << endl;
    throw Napi::TypeError::New( env, "Expected two arguments" );
  }
  int id = info[0].As<Napi::Number>().Int32Value();
  cout << id << endl;
  unsigned char* send_buf = static_cast<unsigned char*>(info[1].As<Napi::ArrayBuffer>().Data());
  cout << send_buf[0] << endl;
  if (0 == can_box_instance.transmit(CAN_CHL0, id, send_buf, 8)) {
    return Napi::Boolean::New(env, false);
  }
  std::this_thread::sleep_for(std::chrono::milliseconds(10));
  return Napi::Boolean::New(env, true);
}


Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("startBox", Napi::Function::New(env, StartBox));
  exports.Set("sendInfoLoop", Napi::Function::New(env, SendInfoLoop));
  exports.Set("closeBox", Napi::Function::New(env, CloseBox));
  exports.Set("stopSendInfoLoop", Napi::Function::New(env, StopSendInfoLoop));
  exports.Set("sendCanBuffer", Napi::Function::New(env, SendCanBuffer));
  return exports;
}


NODE_API_MODULE(canbox, Init)
