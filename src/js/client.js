class Client
{
    constructor(name, pass)
    {
        this.name = name;
        this.pass = pass;

        /* Replace with our group number */
        this.group = 999;      

        /* Server name */
        this.server = "http://twserver.alunos.dcc.fc.up.pt:8008/";

        /* Game Hash Code */
        this.gameCode = null;

        /* Game piece color */
        this.color = null;
    }

    executeCommandRegister()
    {   
        this.executeCommand(this.server+"register", {"nick":this.name, "pass":this.pass})
            .then(data => {this.valididRegister(data)})
            .catch(data => {console.log(data); switchPanel(0)});
    }

    valididRegister(data)
    {
        "error" in data ? switchPanel(0): switchPanel(1);
    }

    executeCommandJoin()
    {
        this.executeCommand(this.server+"join", {"group":this.group, "nick":this.name, "pass":this.pass})
            .then(data => {this.gameCode = data.game; this.color = data.color; this.listenToServer(); console.log(data)})
            .catch(console.log);

    }

    listenToServer()
    {
        let url = this.server+"update?nick="+this.name+"&game="+this.gameCode;
        console.log(url);
        const eventSource = new EventSource(url)

        eventSource.onmessage = function(event) 
        {
            const data = JSON.parse(event.data);
            console.log(data);
        }
    }

    executeCommandLeave()
    {
        this.executeCommand(this.server+"leave", {"nick":this.name, "pass":this.pass, "game":this.gameCode})
            .then(data => {this.gameCode = null; this.color = null; })
            .catch(console.log);
    }

    ignoreServer()
    {
        this.eventSource.close();
    }

    executeCommandRanking()
    {
        this.executeCommand(this.server+"ranking")
            .then(data => console.log(data))
            .catch(console.log);
    }

    executeCommandNotify(move)
    {
        this.executeCommand(this.server+"notify", {"nick":this.name, "pass":this.pass, "game":this.gameCode, "move":move})
            .then(data => console.log(data))
            .catch(console.log);
    }
 
    async executeCommand(url, content = {})
    {
        const response = await fetch(url, 
            {
                method: 'POST', 
                body: JSON.stringify(content)
            });

        return response.json();
    }


}
