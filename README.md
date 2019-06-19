A simple messenger using Socket.io, MongoDB and Express

## Setup
```
npm install
```
## Config MongoDB connection
Copy `.env.example` and rename to `.env` file
```
MONGODB_URL="mongodb://localhost:27017"
MONGODB_REQUIRE_AUTH=true
MONGODB_USER="admin"
MONGODB_PASS="admin"
MONGODB_AUTH_DB="admin"
MONGODB_DB_NAME="messenger_db"
```
## How to use
```
npm start
```
- Then Open browser http://localhost:3000
- Input username
- Open another page, input with another name, then we can choose which one we want to private message
