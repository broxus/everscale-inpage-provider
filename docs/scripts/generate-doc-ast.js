const { exec } = require('child_process');

const path = './docs/build/typedoc-ast.json';

if (module === require.main) {
  exec(`typedoc --json ${path}`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });
}
