{
  "targets": [
    {
      "target_name": "canbox",
      "sources": [ "./src/can.cc" ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")",
            "<!@(node -p \"require('napi-thread-safe-callback').include\")",
        ],
        'libraries': [],
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ]
    }
  ]
}