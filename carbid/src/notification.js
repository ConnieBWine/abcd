export class NotificationService {
    constructor() {
        this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
        this.subscribers = new Set();
    }

    connect(address) {
        this.socket.onopen = () => {
            this.socket.send(JSON.stringify({
                type: 'subscribe',
                address: address
            }));
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.notifySubscribers(data);
        };
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers(data) {
        this.subscribers.forEach(callback => callback(data));
    }

    disconnect() {
        this.socket.close();
    }
}

export const useNotifications = (address) => {
    const [notifications, setNotifications] = useState([]);
    
    useEffect(() => {
        const service = new NotificationService();
        
        service.connect(address);
        const unsubscribe = service.subscribe((notification) => {
            setNotifications(prev => [notification, ...prev]);
        });
        
        return () => {
            unsubscribe();
            service.disconnect();
        };
    }, [address]);

    return notifications;
};