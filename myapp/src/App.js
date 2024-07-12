import React, { useRef } from "react";
import "./App.css";
import Swal from "sweetalert2";
import { FaPenNib, FaPlus, FaUser } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";
import { IoClose, IoLogOut, IoMenu, IoMic } from "react-icons/io5";
import { MessageList, Message } from "@chatscope/chat-ui-kit-react";
import chatgptLogo from "./assets/chatgpt.svg";
import { IoMdSend } from "react-icons/io";
import gptlogo from "./assets/chatgptLogo.svg";
import { Link } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import useClipboard from "react-use-clipboard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_KEY = "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";
// "Explain things like you would to a 10 year old learning how to code.";
const systemMessage = {
  role: "system",
  content:
    "Explain things like you're talking to a software professional with 2 years of experience.",
};

function App() {
  const ref = useRef(null);
  const [choices, setChoices] = useState([
    {
      id: 1,
      choice: "what is python",
    },
    {
      id: 2,
      choice: "who is father of quantum physics",
    },
    {
      id: 3,
      choice: "what are the importance of AI and machine learning",
    },
  ]);
  const [menuchange, setMenuChange] = useState(false);
  const [textToCopy, setTextToCopy] = useState();
  const [val, setVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [show, setshow] = useState(false);
  const [messages, setMessages] = useState([
    { message: "", sentTime: "just now", sender: "ChatGPT" },
  ]);
  function addItem(val) {
    if (val.length >= 15) {
      const id = choices.length ? choices[choices.length - 1].id + 1 : 1;
      const newlist = { id, choice: val };
      const addlist = [...choices, newlist];
      console.log(addlist);
      setChoices(addlist);
    } else return;
  }

  async function handlesubmit() {
    if (val.trim() === "") {
      Swal.fire({
        title: "Error!",
        text: "You Ask Me Anything brooo...",
        icon: "error",
      });
      return 0;
    }
    await addItem(val);
    await handleSend(val);
  }

  const handlepress = (e) => {
    if (e.key === "Enter") {
      handlesubmit();
    }
  };
  const handleSend = async (message) => {
    setIsTyping(false);
    setVal("");
    ref.current.focus();
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data.choices[0].message.content);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
      });
  }

  const navi = useNavigate();
  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
  const { transcript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  function sendrequest() {
    setshow(!show);
    handleSend(transcript);
  }
  return (
    <>
      <div className="App">
        <div className="sidebar">
          <div className="upperside">
            <div className="head">
              <img src={chatgptLogo} alt="" />
              <h1>GPT-MAX</h1>
            </div>
            <div className="newchat">
              <button>
                <FaPlus /> New Chat
              </button>
            </div>
            <div className="links">
              <Link to="/imageai">AI Images</Link>
            </div>
          </div>
          <div className="lowerside">
            <FaHistory />
            <h1>Recent History</h1>
            <ul>
              {choices.map((item) => {
                return (
                  <li key={item.id}>
                    <div>
                      <FaPenNib />
                      {item.choice}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="bottom">
            <p onClick={() => navi("/profile")}>
              <FaUser />
              Profile
            </p>
            <Link to="/register">
              <p>
                <IoLogOut />
                Logout
              </p>
            </Link>
          </div>
        </div>
        <div className="main">
          <div className="topcontent">
            <IoMenu id="menuicon" onClick={() => navi("/sidebar")} />
            <div className="head2">
              <img src={chatgptLogo} alt="" />
              <h1>GPT-MAX</h1>
            </div>
            <FaUser onClick={() => navi("/register")} />
          </div>
          {messages.sender === "user" ? null : (
            <div className="gpt">
              <img src={chatgptLogo} alt="chatgpt logo" />
              <h1>How Can I Help You Today ?</h1>
            </div>
          )}
          <MessageList className="msg">
            {messages.map((message, i) => {
              return (
                <>
                  <div className="content">
                    {message.sender === "user" ? <FaUser /> : null}
                    <Message
                      key={i}
                      model={message}
                      id={message.sender === "user" ? "msgai" : "msguser"}
                    />
                  </div>
                </>
              );
            })}
          </MessageList>
          <div className="textbox">
            <input
              type="text"
              autoComplete="off"
              onKeyPress={(e) => handlepress(e)}
              ref={ref}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="Type Message Here..."
            />
            <button onClick={() => handlesubmit()}>
              <IoMdSend />
            </button>
            <IoMic id="mic" onClick={() => setshow(!show)} />
          </div>
        </div>
      </div>
      {show ? (
        <div className="container">
          <h2>GPT - VOICE</h2>
          <IoClose id="wrong" onClick={() => setshow(!show)} />
          <div
            className="main-content"
            onClick={() => setTextToCopy(transcript)}
          >
            <FaUser /> <h4 id="h4"></h4>
            {transcript}
          </div>
          <div className="btn-style">
            {/* <button onClick={setCopied}>
              {isCopied ? "Copied!" : "Copy to clipboard"}
            </button> */}
            <button onClick={startListening} id="start">
              Start
            </button>
            <button onClick={SpeechRecognition.stopListening} id="stop">
              Stop
            </button>
            <button onClick={() => sendrequest()} id="send">
              send
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default App;
