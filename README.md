# fn-giulia-core-module

This function is executed every 59 minutes (in production it will be scheduled every minute) and has the task of providing the exact time to Giul-IA, it is also executed every time Giul-IA inserts an action related to the core module into the actions queue. At the moment these are the incoming actions:

{ "module": "core", "action": "output", "channel": "stop" } //for future use it communicates to the system that the current conversation has ended
{ "module": "core", "action": "output", "channel": "store", "payload": { "key": string, "value": string } } //stores the data in the long-term memory LTM