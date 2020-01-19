export const hydrateConversation = (conversation, currentUser) => {
    // Make sure the current user is userA. Swap userA and userB if not.
    if (conversation.userAId !== currentUser.id) {
        const { userA } = conversation;
        conversation.userA = conversation.userB;
        conversation.userAId = conversation.userBId;
        conversation.userB = userA;
        conversation.userBId = userA.id;
    }
    conversation.lastMessageAt = new Date(conversation.lastMessageAt);
};
