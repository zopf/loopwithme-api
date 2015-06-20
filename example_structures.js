
// GET BOARD STRUCTURE
// server -> client
{
  "action":"board_update",
  "rows":2,
  "cols":2,
  "loop_length":16,
  "cards":[
    {
      "row":0,
      "col":0,
      "loop":[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]
    },
    {
      "row":0,
      "col":1,
      "loop":[1,1,1,0,1,1,1,0,1,0,0,0,1,0,0,0]
    },
    {
      "row":1,
      "col":0,
      "loop":[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]
    },
    {
      "row":1,
      "col":1,
      "loop":[1,1,1,0,1,1,1,0,1,0,0,0,1,0,0,0]
    }
  ]
}


// SEND CARD STATE UPDATE
// client -> server
{
  "action":"card_update",
  "row":0,
  "col":1,
  "loop":[1,1,1,0,1,1,1,0,1,0,0,0,1,0,0,0]
}


// PUSH CARD STATE UPDATE
// server -> client
{
  "action":"card_update",
  "row":0,
  "col":1,
  "loop":[1,1,1,0,1,1,1,0,1,0,0,0,1,0,0,0]
}
