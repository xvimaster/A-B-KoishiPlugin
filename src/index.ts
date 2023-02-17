import { Context, Schema } from 'koishi'

export const name = 'a2b'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

var txt="String" //original message
var commandCount=0 //how many commands in A2B

export function apply(ctx: Context) {
  ctx.middleware((session, next) => {
    txt = session.content
    if (txt.substring(0,3) ==='A=B' || txt.substring(0,3) ==='A2B') {
      var slength=txt.length
      var txtProceed=txt.substring(4,txt.length)
      commandCount=0
      for(var i=1; i<txtProceed.length;i++){
        if(txtProceed.charAt(i)==" ") commandCount++
      }
      console.info("---------------------------------------")
      console.info(commandCount)
      var commands=txtProceed.split(" ",commandCount+1)

      //A=B language part
      var A2BString=commands[0]
      var process=1 //indicates which command is now running
      var antiDeadLoop=0 //autoquit in 1000 commands
      var nowCommand=" " //which command is running now

      //A=B special commands variables

      
      
      while(process<=commandCount && antiDeadLoop<1000){
        // now not available with "return""start""end""once"commands
        nowCommand=commands[process]
        var ios=nowCommand.split("=",2)
        var replaceMark=A2BString.indexOf(ios[0]) 

        console.info(nowCommand)
        console.info(replaceMark)

        if(replaceMark>=0){  //if this command can run
          var piece1=A2BString.substring(0,replaceMark);
          var piece2=A2BString.substring(replaceMark+ios[0].length,A2BString.length)// i hope this wont cause any bug
          A2BString=piece1.concat(ios[1],piece2)
          process=1;
          console.info(A2BString+" this turn")
          antiDeadLoop++;
        }else{
          process++; //move to next command
        }
        
      }
      if (A2BString.length==0) return "程序无输出"
      if (A2BString.length>255) return "输出大于255个字符。请检查潜在的死循环"
      return A2BString

    } else {
      return next()
    }
  })
}
