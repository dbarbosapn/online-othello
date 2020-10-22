/* Para poupar memoria vamos usar chars em vez de strings, estou 
    um pouco preocupado com o uso de memoria para gerar os clones
    '0' = empty
    '1' = dark
    '2' = light */

class Board {
    size = 0;
    dark = 0;
    light = 0;
    state = [];

    constructor(size, state = null, dark = 0, light = 0) {
        this.dark = dark;
        this.light = light;
        this.size = size;
        state = new Array(size*size);

        if ( !state ) {
            this.emptyState();
        }
        
        else {

        }

    }

    cloneBoard(board) {
        if ( board == null ) { return null; }

        return new Board(board.size, board.state, board.dark, board.light);
    }

    emptyState() {
        let totalSize = this.size*this.size;

        for( let i = 0; i<totalSize; i++) {
            this.state[i] = '0';
    }

    copyState(state) {
        let totalSize = this.size*this.size;

        for( let i = 0; i<totalSize; i++) {
            this.state[i] = state[i];
    }

    getCoordinates(i, j) { return i*this.size + j;  }

    decode(ch) {
        switch(ch) {
            case '0':
                return "empty";

            case '1':
                return "dark";

            case '2':
                return "light";

            default:
                console.log("Unknown Piece. Returned empty");
                return "empty";
        }
    }

    encode(str) {
        switch(str) {
            case "empty":
                return '0';

            case "dark":
                return '1';

            case "light":
                return '2';

            default:
                console.log("Unknown Piece. Returned '0'");
                return '0';
        })
    }

    
}