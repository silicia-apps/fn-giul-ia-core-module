import { Client, Databases, Query, ID, Models } from 'node-appwrite';
import { Telegraf } from 'telegraf';

//import * as process from './env.js';

function log(text: string) {
  console.log(text);
}
function error(text: string) {
  console.error(text);
}

type Context = {
  req: any;
  res: any;
  log: (msg: string) => void;
  error: (msg: string) => void;
};

export interface HistoryItem {
  role: 'model' | 'user';
  parts: {
    text: string;
  }[];
}

export interface Message extends Models.Document{
  $id: string;
  message: string;
  thought: Thought;
  bot: boolean;
  chat: Chat;
}

export interface Thought extends Models.Document {
  thought: string;
  message: Message;
}

export interface Chat {
  $id: string;
  chat_id: string;
  channel: 'telegram' | 'alexa';
  messages: Message[];
}

export interface Module {
  name: string;
  description: string;
  queue: string[];
  actions: string[];
  events: string[];
}
export interface SlotLtm {
  key: string;
  value: string[];
}

export interface Es {
  $id: string;
  fear?: number;
  happiness?: number;
  sadness?: number;
  anger?: number;
  surprise?: number;
  disgust?: number;
  anxiety?: number;
  excitement?: number;
  frustration?: number;
  satisfaction?: number;
  curiosity?: number;
  boredom?: number;
  nostalgia?: number;
  hope?: number;
  pride?: number;
  shame?: number;
  concentration?: number;
  confusion?: number;
  calm?: number;
  stress?: number;
  creativity?: number;
  empathy?: number;
  logic?: number;
  humor?: number;
  learning?: number;
  connection?: number;
  autonomy?: number;
}

export interface Profile extends Models.Document {
  name: string;
  chats: Chat[];
  es: Es;
  queue: string[];
  ltm: SlotLtm[];
  modules: Module[];
}

export default async ({ req, res, log, error }: Context) => {
  const telegram_token = req.headers['x-telegram-bot-api-secret-token'];
  //try {
  if (telegram_token === process.env.APPWRITE_API_KEY!) {
    log('connect to Telegram Bot');
    const bot = new Telegraf(process.env.TELEGRAM_TOKEN!);
    log('connect to appwrite api');
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    let datastore = new Databases(client);
    let chat = await datastore.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_TABLE_CHATS_ID!,
      [
        Query.equal('channel', 'telegram'),
        Query.equal('chat_id', String(req.body.message.chat.id)),
        Query.limit(1),
      ]
    );
    switch (req.body.message.text) {
      case '/start':
        log('present the bot');
        bot.telegram.sendMessage(
          String(req.body.message.chat.id),
          'Hello everyone! I am an AI under development, with learning and conversational abilities. To start interacting with me, type the magic word. 😉 What is the magic word?'
        );
        break;
      case 'start@imitation@game':
        log('Registrazione Bot');
        if (chat.total === 0) {
          log('User not present');
          const new_user = {
            es: { fear: 0 },
            ltm: [
              {
                key: 'first_name_user',
                value: [req.body.message.from.first_name],
              },
              {
                key: 'last_name_user',
                value: [req.body.message.from.last_name],
              },
              {
                key: 'prefered_language_user',
                value: [req.body.message.from.language_code],
              },
              {
                key: 'username_user',
                value: [req.body.message.from.username],
              },
            ],
            name: req.body.message.from.username,
            chats: [
              {
                channel: 'telegram',
                chat_id: String(req.body.message.chat.id),
              },
            ],
          };
          log(`write new user`);
          log(JSON.stringify(new_user));
          await datastore.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_TABLE_PROFILES_ID!,
            ID.unique(),
            new_user
          );
          log(`user created`);
          bot.telegram.sendMessage(
            String(req.body.message.chat.id),
            "You managed to say the magic word and now we can finally start interacting. 🤖 If you're curious to see what commands I can execute, visit t.me/giul_ia_actions_bot, while if you want to take a look at my thought process, I'm waiting for you at t.me/giul_ia_think_bot. To interact with me, just write in this chat! 😉 Up until now, you've been shown prerendered text, now the magic happens."
          );
        } else {
          bot.telegram.sendMessage(
            String(req.body.message.chat.id),
            'Welcome Back to Giulia BOT'
          );
          log(`user already in database`);
        }
        break;
      default:
        if (chat.total > 0) {
          datastore.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_TABLE_MESSAGES_ID!,
            ID.unique(),
            {
              chat: chat.documents[0].$id,
              message: req.body.message.text,
            }
          );

          log('add message to user chat');
        } else {
          error('No User Found');
          bot.telegram.sendMessage(
            String(req.body.message.chat.id),
            "i'm curious to get to know you, but to interact with you, you'll need to say the magic word! 😉 What are you waiting for? 😄"
          );
        }
    }
  } else {
    if (req.body.action) {
      const action = JSON.parse(req.body.action);
      const client = new Client()
          .setEndpoint(process.env.APPWRITE_ENDPOINT!)
          .setProject(process.env.APPWRITE_PROJECT_ID!)
          .setKey(process.env.APPWRITE_API_KEY!);
        let datastore = new Databases(client);
        const messages: Models.DocumentList<Message> =
          await datastore.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_TABLE_MESSAGES_ID!,
            [Query.equal('$id', req.body.thought.message.$id)]
          );
        if (messages.total > 0) {}
      if (
        action.module === 'core' &&
        action.action === 'talk' &&
        action.channel === 'telegram'
      ) {
        log('add message in conversation');
        log('connect to appwrite api'); 
        datastore.createDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_TABLE_MESSAGES_ID!,
          ID.unique(),
          {
            message: action.payload.value,
            bot: true,
            chat: messages.documents[0].chat.$id,
          }
        );
        log('connect to Telegram Bot');
        const bot = new Telegraf(process.env.TELEGRAM_TOKEN!);
        log(`sent message to telegram channel to ${action.payload.chat_id}`);
        log(JSON.stringify(action));
        bot.telegram.sendMessage(
          String(action.payload.chatid),
          action.payload.value
        );
      } else {
        const bot = new Telegraf(process.env.TELEGRAM_TOKEN_ACTION!);
        log(`sent action to telegram channel`);
        bot.telegram.sendMessage(
          String(action.payload.chatid),
          JSON.stringify(req.body.action)
        );
      }
    } else {
      error('api key not is valid');
    }
  }
  if (req.method === 'GET') {
    return res.send('Silicia - Giul-IA BOT - telegram gateway');
  }
  /* } catch (e: any) {
    error(JSON.stringify(e));
  }*/
  return res.empty();
};
