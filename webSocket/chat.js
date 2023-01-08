const chat = (io) => {
    let activeUsers = [
        // {
        //     userId: '633e96c71160d5811f8b791e',
        //     socketId: 'hTpGIDxMkH0lCSl8AAAH',
        //     busy: false,
        //     chatCount: 0
        // }
        // {
        //     userId: "986709eivjnxkj4gndoyuo=-4",
        //     socketId: "986709eivjnx4kjgn-3423asd",
        //     busy: true,
        //     chatCount: 46,
        //     role: "media",
        // },
        // {
        //     userId: "986709eivjnxsdf3sdfkjgnd",
        //     socketId: "986709eivjn4xk4",
        //     busy: true,
        //     chatCount: 45,
        //     role: "media",

        // },
        // {
        //     userId: "986709eivj45g",
        //     socketId: "986709eivsda425l,k0",
        //     busy: false,
        //     chatCount: 13,
        //     role: "finance",
        // },
        // {
        //     userId: "986709ei34523vjnxsdfffg",
        //     socketId: "986709eivsd6a45l,k0",
        //     busy: true,
        //     chatCount: 33,
        //     role: "t",
        // }
    ];

    io.on("connection", (socket) => {

        socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        });

        socket.on("setup", ({ userId, room }) => {
            socket.join(`${userId}${room}`);
            console.log("joined the room", `${userId}${room}`);
            socket.emit("connected");
        });


        socket.on("new-user-add", (userId, socketId, role) => {
            if (!activeUsers.some((user) => user.userId === userId)) {
                activeUsers.push({ userId, socketId, busy: false, chatCount: 0, role });
            }
            console.log("Added: ", activeUsers);
            io.emit("get-users", activeUsers);
        });


        socket.on("update-user", (userId, socketId) => {
            const isExist = activeUsers.some(user => user.userId === userId);

            if (isExist) {
                activeUsers = activeUsers
                    .map((user) => user?.userId === userId ? { ...user, socketId: socketId } : user);
            }

            console.log("updated User: ", activeUsers)
        });


        socket.on("send-chat", (data, userId, room) => {
            let currUser;
            const freeUsers = activeUsers.filter((user) => !user.busy && user.role === room);
            const busyUsers = activeUsers.filter((user) => user.busy && user.role === room);

            const mostFreeUser = freeUsers.sort((a, b) => a.chatCount - b.chatCount)[0];
            const mostBusyUser = busyUsers.sort((a, b) => a.chatCount - b.chatCount)[0];

            if (mostFreeUser) {
                activeUsers = activeUsers.map((user) =>
                    user?.userId === mostFreeUser?.userId
                        ? currUser = user && { ...user, busy: Boolean(true), chatCount: ++mostFreeUser.chatCount } : user)

            } else {
                activeUsers = activeUsers.map((user) =>
                    user?.userId === mostBusyUser?.userId
                        ? currUser = user && { ...user, busy: true, chatCount: ++mostBusyUser.chatCount } : user)
            }
            console.log("Admin: ID: ", currUser?.socketId);
            if (currUser && data.subject && data.description && data.messages.length === 0) {
                console.log("Admin: ", currUser?.socketId);
                // console.log("in Current Usr: ", currUser.socketId, socket.id)
                io.to(currUser?.socketId).emit("chat-lists", data, userId);
                // socket.to(currUser.userId).emit("receive-chat", data, wsId);
                // socket.in(room).emit("chat-lists", data);
                // io.to(currUser.socketId).emit("receive-message", data, wsId);
                // socket.to(currUser.socketId).emit("receive-message", data, wsId);
            }
        });

        socket.on("send-message", (data, { userId, room }) => {
            socket.in(`${userId}${room}`).emit("receive-message", data);
        })

        socket.on("emit-typing", ({ userId, room }) => socket.to(`${userId}${room}`).emit("typing"));
        socket.on("stop-typing", ({ userId, room }) => socket.to(`${userId}${room}`).emit("stop-type"));

        socket.on("close-chat", ({ userId, room }) => {
            console.log(`${userId}${room}`)
            io.in(`${userId}${room}`).emit("close-chat-box")
        });

        socket.on("disconnect", () => {
            console.log("left", socket.id);
            // activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
            io.emit("get-users", activeUsers);
        });
    });
}

export default chat;