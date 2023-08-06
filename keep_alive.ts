const express = require('express');
import config from "./config";
const keep_alive = (obj:any = {}) =>{
const app = express();
  
const port = 3000;
app.get('/', (req: any, res: any)=>{
   res.status(200).send("bot running..")
//    res.sendStatus(200)
})

app.use(express.json());
// Endpoint to accept an object
app.post('/obj', (req:any, res:any) => {
  try {

  const receivedObject = req.body;
  // console.log('Received object:', receivedObject);
 obj["" + receivedObject.from.id + ""] = {text: config.startSymbol + receivedObject.data + " " + receivedObject.message.text,
   cmp: receivedObject.data
    }
   
  // Perform any required operations with the received object

  res.status(200).json({ message: 'Object received successfully' });
        
  } catch (error: any) {
  res.status(200).json({ message: 'Some error' });
  }
});
  
app.listen(port, () => console.log(`Bot running on http://localhost:${port}`));
}
export default keep_alive