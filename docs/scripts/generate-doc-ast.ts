import { exec } from 'child_process';

const path = './docs/build/typedoc-ast.json';

if (module === require.main) {
  exec(`typedoc --json ${path}`, (err, stdout) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(stdout);
  });
}
