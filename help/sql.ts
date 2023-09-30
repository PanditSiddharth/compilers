function sql(code:any) {
          code = code.replace(/\/sql/i, "")
            .replace(/\/\/.*/g, "")
          let arr = code.split(";")
          let ele;
          for (let i = 0; i < arr.length; i++) {
            ele = arr[i]
            if (ele) {
              ele = ele.replace(/\s/g, "\\s")
                .trim()
                .replace(/\n+/g, "\n")
                .replace(/\n/g, "\\s")
                .replace(/\,/g, "\\,")
                .replace(/\(/g, "\\(")
                .replace(/\)/g, "\\)")
                .replace(/\[/g, "\\[")
                .replace(/\'/g, "\\'")
                .replace(/\"/g, '\\"')
                .replace(/\?/g, "\\?")
                .replace(/\*/g, "\\*")
                .replace(/\+/g, "\\+")
                .replace(/\{/g, '\\{')
                .replace(/\}/g, '\\}')

              if(ele.match(/select/i)){
        code = code.replace(new RegExp("((?<!(run|all)\\s?\\(\\s?)" + ele + ";)"), `db.all(\`$1\`, (err, rows) => {
        if (err) throw err;
        console.log(rows);
    });\n`)
                .replace(/(?<=(run|all)\(\s*`?'?)\s*\n*/g, "")
              } else {
              code = code.replace(new RegExp("((?<!run\\s?\\(\\s?)" + ele + ";)"), "db.run(`$1" + "`)\n\n")
                .replace(/(?<=run\(\s*'?`?)\s*\n*/g, "")
              }
            }
          }

          let strat =
            `const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

db.serialize(() => {\n`

          let endd = "});\ndb.close();"

          code = strat + code + endd

return code
}
export default sql