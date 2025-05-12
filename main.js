const scriptName = "던붕이봇";
let debugSender = "DEBUG SENDER";

const baseURL = "https://github.com";

// 메시지 파서가 분리한 문자열 목록을 빌드하여 의미있는 커맨드를 만든다.
function Command(words)
{
  this.origin = words;
  this.commandName = "";
  this.params = new Array();
}

Command.prototype = {};
Command.prototype.Make = function()
{
  if (this.origin == null || this.origin.length <= 0)
    return;

  commandName = this.origin[0];
  for(var i = 1; i < this.origin.length; i++)
  {
    this.params.push(this.origin[i]);
  }
};

Command.prototype.IsValid = function()
{
  return true;
};

// 메시지를 파싱하여 커맨드를 만든다.
function CommandFactory(msg)
{
  this.msg = msg;
  this.ParseMsg = function()
  {
    if(msg == null)
      return null;

    var words = msg.split(' ');
    if(words == null || words.length <= 0)
      return null;

    return words;
  };
}

CommandFactory.prototype = {};
CommandFactory.prototype.Make = function()
{
  var words = this.ParseMsg();
  if (words == null)
  {
    return null;
  }
    
  var command = new Command(words);
  command.Make();

  if (command.IsValid())
    return command;

  return null;
};


// 정보를 기반으로 답장을 만들어 송신
function ReplyMaker(replier)
{
  this.replier = replier;

  this.MakeMsg = function(info)
  {
    return info;
  };
}

ReplyMaker.prototype = {};
ReplyMaker.prototype.Work = function(info)
{
  var msg = this.MakeMsg(info);
  this.replier.reply(msg);
};


// 웹 서버와 통신하여 메시지 수신과 송신 사이를 중재
function MessageMediator(sender, replier)
{
  this.sender = sender;
  this.replier = replier;
  this.baseURL = baseURL;

  this.Request = function(command)
  {
    var url = this.MakeURL(command);
    return Utils.parse(url);
  };

  this.MakeURL = function(command)
  {
    var url = this.baseURL + "?";
    if(command.params == null)
      return url;

    for(var i = 0; i < command.params.length; i++)
    {
      url += "p";
      url += i;
      url += "=";
      url += command.params[i];
      url += "&";
    }

    return url;
  };

  this.Reply = function(msg)
  {
    replier = new ReplyMaker(this.replier);
    replier.Work(msg);
  };
}

MessageMediator.prototype = {};
MessageMediator.prototype.Work = function(msg)
{
  var commandFactory = new CommandFactory(msg);
  var command = commandFactory.Make();
  if (command == null)
  {
    this.Reply("커맨드 제작 실패");
    return;
  }

  var response = this.Request(command); // 현재 동기 방식
  this.Reply(response);
};


/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName)
{
  var thread = new java.lang.Thread(function()
  {
    var mediator = new MessageMediator(sender, replier);
    mediator.Work(msg);
  });

  thread.start();
}

//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("ON!");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}