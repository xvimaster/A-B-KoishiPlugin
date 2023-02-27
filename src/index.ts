import { Context, Schema } from 'koishi'
import { REPL_MODE_SLOPPY } from 'repl'

export const name = 'a2b'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

var txt="String" //original message
var commandCount=0 //how many commands in A2B

export function apply(ctx: Context) {
  ctx.middleware((session, next) => {
    txt = session.content
    if (txt.substring(0,3) ==='A=B' || txt.substring(0,9) ==='A2BDetail') {
      var slength=txt.length
      var doDetail=0 //if the program shows details
      if(txt.substring(0,9)=='A2BDetail')var txtProceed=txt.substring(10,txt.length); else var txtProceed=txt.substring(4,txt.length);
      if(txt.substring(0,9)=='A2BDetail')doDetail=1;else doDetail=0;
      commandCount=0
      for(var i=1; i<txtProceed.length;i++){
        if(txtProceed.charAt(i)==" ") commandCount++
      }
      console.info("---------------------------------------")

      var commands=txtProceed.split(" ",commandCount+1)

      //A=B language part
      var A2BString=commands[0]
      var process=1 //indicates which command is now running
      var antiDeadLoop=0 //autoquit in 1000 commands
      var nowCommand=" " //which command is running now

      //A=B special commands variables
      var isReturn=0 //is there an return command in the second section of the command
      var isOnce=0 //is there an Once command in the first section of the command
      var replaceMark=0
      //is there start or end command on L or R side
      var isLStart=0
      var isRStart=0
      var isLEnd=0
      var isREnd=0 
      
    
      while(process<=commandCount && antiDeadLoop<1000){
        
        nowCommand=commands[process]
        if(nowCommand!="NULL"){

          console.info("A2BString: " + A2BString)

          var ios=nowCommand.split("=",2)
          isOnce=ios[0].indexOf("(once)")
          isReturn=ios[1].indexOf("(return)")
          
          isLStart=ios[0].indexOf("(start)")
          isLEnd=ios[0].indexOf("(end)")
          isRStart=ios[1].indexOf("(start)")
          isREnd=ios[1].indexOf("(end)")
          var EndIndicator //calculates where the end mark Should be

          if((isLStart!=-1 && isLEnd!=-1)||(isLStart!=-1 && isOnce!=-1)||(isOnce!=-1 && isLEnd!=-1)) return "不允许在左侧有多个关键字！"
          if((isRStart!=-1 && isREnd!=-1)||(isRStart!=-1 && isReturn!=-1)||(isReturn!=-1 && isREnd!=-1)) return "不允许在右侧有多个关键字！"


          if(isLStart!=-1){
            ios[0]=ios[0].substring(7,ios[0].length)
            if(A2BString.indexOf(ios[0])==0)replaceMark=0; else replaceMark=-1;
            //only matches the start section of the string
            if(A2BString.indexOf(ios[0])==0) A2BString=A2BString.substring(ios[0].length,A2BString.length)
            //remove the start section in A2BString
          }else if(isLEnd!=-1){
            ios[0]=ios[0].substring(5,ios[0].length)
            EndIndicator=A2BString.length-ios[0].length 
            if(A2BString.lastIndexOf(ios[0])==EndIndicator)replaceMark=EndIndicator; else replaceMark=-1;
            //only matches the end section of the string
            if(A2BString.lastIndexOf(ios[0])==EndIndicator) A2BString=A2BString.substring(0,A2BString.length-ios[0].length)
            //remove the end section in A2BString
            console.info("LEndIndicator:"+EndIndicator)

          }else if(isOnce!=-1){
            ios[0]=ios[0].substring(6,ios[0].length)
            replaceMark=A2BString.indexOf(ios[0])
            A2BString=A2BString.substring(0,replaceMark)+A2BString.substring(replaceMark+ios[0].length,A2BString.length)
            //now neutrialize the command
            commands[process]="NULL"
          }else{ //not once, not start and not end
            replaceMark=A2BString.indexOf(ios[0]) //look for the command string in A2BString
            if(replaceMark!=-1) A2BString=A2BString.substring(0,replaceMark)+A2BString.substring(replaceMark+ios[0].length,A2BString.length)
          }
            
          
          //---DEBUG---
          console.info(nowCommand)
          console.info(A2BString.length)
          console.info("---")
          //---DEBUG---*/

          if(replaceMark>=0){  //if this command can run
            if(doDetail){
              //got way too lazy to write these
              //well who cares
            }
            if(isReturn!=-1){ //check for straight return
              A2BString=ios[1].substring(8,ios[1].length)
              A2BString="the program returns:" + A2BString
              return A2BString
            }else if(isRStart!=-1){
              ios[1]=ios[1].substring(7,ios[1].length)
              A2BString=ios[1]+A2BString
              antiDeadLoop++
              process=1;
            }else if(isREnd!=-1){
              ios[1]=ios[1].substring(5,ios[1].length)
              A2BString=A2BString+ios[1]
              antiDeadLoop++
              process=1;
            }else if(isLStart==1){
              A2BString=ios[1]+A2BString
              antiDeadLoop++
              process=1;
            }else if(isLEnd==1){
              A2BString=A2BString+ios[1]
              antiDeadLoop++
              process=1;
            }else{

              A2BString=A2BString.substring(0,replaceMark)+ios[1]+A2BString.substring(replaceMark,A2BString.length)
              process=1;
              antiDeadLoop++;
            }
            if (A2BString.length>255) return "输出大于255个字符。请检查潜在的死循环"
          }else{
            if (A2BString.length>255) return "输出大于255个字符。请检查潜在的死循环"
            process++; //move to next command
          }
        }else{
          process++;  //move to the next command while the command is neutrialized
        }
      }
      if (antiDeadLoop>=999) return "运行超过1000行程序，请检查死循环！"
      if (A2BString.length==0) return "程序无输出"
      if (A2BString.length>255) return "输出大于255个字符。请检查潜在的死循环"
      A2BString="the program returns:" + A2BString
      return A2BString

    } else {
      return next()
    }
  })
}
