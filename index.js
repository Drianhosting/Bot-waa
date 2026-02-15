const {
default: makeWASocket,
useMultiFileAuthState,
fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys')

const fs = require("fs")

const ownerFile = "./owner.json"


// buat file owner kalau belum ada

if (!fs.existsSync(ownerFile)) {

fs.writeFileSync(ownerFile, JSON.stringify([
"149216122925082"
]))

}


async function startBot() {

const { state, saveCreds } =
await useMultiFileAuthState('session')

const { version } =
await fetchLatestBaileysVersion()


const sock =
makeWASocket({
version,
auth: state
})


console.log("Bot berhasil dijalankan!")


sock.ev.on('creds.update', saveCreds)



sock.ev.on('messages.upsert',
async ({ messages }) => {

try {

const m = messages[0]

if (!m.message) return


const from =
m.key.remoteJid


const isGroup =
from.endsWith('@g.us')


const sender =
isGroup
? m.key.participant
: from


// FIX LID

const senderID =
sender.split("@")[0]


const text =
m.message.conversation ||
m.message.extendedTextMessage?.text ||
''


// load owner setiap pesan

let owner =
JSON.parse(
fs.readFileSync(ownerFile)
)


const isOwner =
owner.includes(senderID)



// =================
// TAGALL (ASLI)
// =================

if (text.startsWith(".tagall")) {

if (!isGroup) return

if (!isOwner) return


const metadata =
await sock.groupMetadata(from)


let mentions =
metadata.participants.map(x => x.id)


let pesan =
text.replace(".tagall", "").trim()


if (!pesan) pesan = "\u200B"


await sock.sendMessage(from, {

text: pesan,
mentions: mentions

})

}



// =================
// ADD OWNER (SAFE)
// =================

if (text.startsWith(".addowner")) {

if (!isOwner) return


let nomor =
text.split(" ")[1]


if (!nomor) return


nomor =
nomor.replace(/[^0-9]/g, "")


if (owner.includes(nomor)) {

sock.sendMessage(from, {
text: "Sudah owner"
})

return

}


owner.push(nomor)


fs.writeFileSync(
ownerFile,
JSON.stringify(owner, null, 2)
)


sock.sendMessage(from, {
text: "Owner ditambahkan"
})

}



} catch (err) {

console.log("ERROR:", err)

}


})

}


startBot()

const express = require("express")
const app = express()

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send("Bot WA Aktif 🚀")
})

app.listen(PORT, () => {
  console.log("Web server jalan di port " + PORT)
})
