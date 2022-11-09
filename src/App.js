import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import Lobby from './components/Lobby';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useState } from 'react';
import Chat from './components/Chat';

const App = () => {
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const joinRoom = async (user, room) => {
    try{
      const connection = new HubConnectionBuilder()
      .withUrl("https://simplechatservice.azurewebsites.net/chat")
      .configureLogging(LogLevel.Information)
      .build();

      connection.on("ReceiveMessage", (user, message) => {
        setMessages(messages => [...messages, {user, message}]);
        console.log('message received: ', message);
      })

      connection.on("UsersInRoom", (users) => {
        setUsers(users);
      });

      connection.onclose(e => {
        setConnection();
        setMessages([]);
        setUsers([]);
      });      

      await connection.start();
      await connection.invoke("JoinRoom", {user, room});
      setConnection(connection);

    } catch(e)
    {
      console.log({e});
    }
  }

  const sendMessage = async (message) => {
    try {
      await connection.invoke("SendMessage", message);
    } catch (e) {
      console.log(e);
    }
  }

  const closeConnection = async () => {
    try {
      await connection.stop();
    } catch (error) {
      console.log(error);
    }
  }

  return <div className='app'>
    <h2>Chat Service</h2>
    <hr className='line' />
    {
      !connection ? <Lobby joinRoom={joinRoom} /> 
      : <Chat sendMessage={sendMessage} messages={messages}
              closeConnection={closeConnection} 
              users={users} />
    }
  </div>
}

export default App;
