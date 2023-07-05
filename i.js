const { spawn, exec } = require('child_process');

// Spawn a child process to run the "ls" command
// spawn('pip', ['install', '-r', 'requirements.txt'], { stdio: inherit });
// installer.on('data', (data) => {
//   console.log(data)
// })

// let installer = exec('pip install -r requirements.txt', (stderr, std, err) => {
//   if (stderr)
//     return console.log(stderr)
//   conosle.log(std)
// });
let commands = 'which node && which python && which java && which javac && which go'
let installer = exec(commands, (err, std, stderr) => {
  if (stderr)
    return console.log(stderr)
  if (err)
    return console.log(stderr)
  let arr = std.split('\n')
  let obj = {
    "NODE": arr[0],
    "PYTHON": arr[1],
    "JAVA": arr[2],
    "JAVAC": arr[3],
    "GO": arr[5]
  }
  let fs = require('fs')
  fs.writeFileSync('j.txt', JSON.stringify(obj))
  console.log(obj)

});


// installer.on('data', (data) => {
//   console.log(data)
// })