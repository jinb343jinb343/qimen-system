class QimenSession {
    constructor(staticPanContext) {
        this.staticPanContext = staticPanContext;
        this.dynamicHistory = [];
    }
}

class QimenSessionManager {
    constructor(maxHistoryLength = 6) {
        this.sessions = {};
        this.maxHistoryLength = maxHistoryLength;
    }

    createSession(sessionId, staticPanContext) {
        this.sessions[sessionId] = new QimenSession(staticPanContext);
    }

    appendAndSlideHistory(sessionId, role, content) {
        if (!this.sessions[sessionId]) {
            throw new Error(`Session ${sessionId} 未建立，请先调用 createSession()。`);
        }
        
        const session = this.sessions[sessionId];
        session.dynamicHistory.push({ role, content });
        
        if (session.dynamicHistory.length > this.maxHistoryLength) {
            session.dynamicHistory = session.dynamicHistory.slice(-this.maxHistoryLength);
        }
    }
}

module.exports = { QimenSessionManager };
