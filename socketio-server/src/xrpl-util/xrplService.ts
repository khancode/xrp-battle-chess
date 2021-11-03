import { Client } from "xrpl";

class XrplService {
    public client: Client | null = null;

    public async connect(): Promise<Client> {
        const client = new Client('wss://s.altnet.rippletest.net/')
        await client.connect();
        this.client = client;
        return client;
    }

    public async disconnect(): Promise<void> {
        await this.client.disconnect;
        this.client = null;
    }
}

export default new XrplService();
