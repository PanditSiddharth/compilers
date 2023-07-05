const express = require('express');
const keep_alive = () =>{
const app = express();
const port = 3000;
app.get('/', (req: any, res: any)=>{
   res.status(200).send("bot running..")
//    res.sendStatus(200)
})
  
app.listen(port, () => console.log(`Bot running on http://localhost:${port}`));
}
export default keep_alive