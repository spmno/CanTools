#include <napi.h>
#include <iostream>
#include <memory>

#include "./cpp/timer.hpp"

using namespace std;

Napi::ThreadSafeFunction tsfn;
std::thread nativeThread;
static Timer timer;

Napi::Boolean StartBox(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  cout << "start box from native." << endl;
  return Napi::Boolean::New(env, true);
}

Napi::Value SendInfoLoop( const Napi::CallbackInfo& info )
{
  Napi::Env env = info.Env();

  if ( info.Length() < 2 )
  {
    throw Napi::TypeError::New( env, "Expected two arguments" );
  }
  else if ( !info[0].IsFunction() )
  {
    throw Napi::TypeError::New( env, "Expected first arg to be function" );
  }
  else if ( !info[1].IsNumber() )
  {
    throw Napi::TypeError::New( env, "Expected second arg to be number" );
  }

  int count = info[1].As<Napi::Number>().Int32Value();

  // Create a ThreadSafeFunction
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
  nativeThread = std::thread( [count] {
    auto callback = []( Napi::Env env, Napi::Function jsCallback, int* value ) {
      // Transform native data into JS data, passing it to the provided 
      // `jsCallback` -- the TSFN's JavaScript function.
      jsCallback.Call( {Napi::Number::New( env, *value )} );
      
      // We're finished with the data.
      delete value;
    };

    for ( int i = 0; i < count; i++ )
    {
      // Create new data
      int* value = new int( clock() );

      // Perform a blocking call
      napi_status status = tsfn.BlockingCall( value, callback );
      if ( status != napi_ok )
      {
        // Handle error
        break;
      }

      std::this_thread::sleep_for( std::chrono::seconds( 1 ) );
    }

    // Release the thread-safe function
    tsfn.Release();
  } );

  return Napi::Boolean::New(env, true);
}



Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("startBox", Napi::Function::New(env, StartBox));
  exports.Set("sendInfoLoop", Napi::Function::New(env, SendInfoLoop));
  return exports;
}

NODE_API_MODULE(canbox, Init)
