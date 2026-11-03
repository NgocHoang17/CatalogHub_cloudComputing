// Windows does not deliver Unix SIGTERM like Linux. Exercise the registered
// handler via Node's event system, without claiming an OS signal was delivered.
process.on('message',message=>{
  if(message==='test-sigterm') process.emit('SIGTERM');
});
