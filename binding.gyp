{
  "targets": [
    {
      "target_name": "canbox",
      "sources": [ 
        "./src/can.cc",
        "./src/cpp/can_comm.cc"
        ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")",
            "<!@(node -p \"require('napi-thread-safe-callback').include\")",
        ],
        'libraries': [
          "../src/cpp/ECanVci64.lib"
        ],
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ]
    }
  ]
}