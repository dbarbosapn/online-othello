class Point {

    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }

    /* Add point and return a new added point */
    addPoint(point) {
        return new Point(this.x + point.x, this.y + point.y);
    }

    /* Sub point and return a new subed point */
    subPoint(point) {
        return new Point(this.x - point.x, this.y - point.y);
    }

    /* Mult point and return a the new mult point */
    prodPoint(point) {
        return new Point(this.x * point.x, this.y * point.y);
    }

    tostring() {
        return "(" + this.x + "," + this.y+ ")";
    }
}


/* Para poupar memoria vamos usar chars em vez de strings, estou 
    um pouco preocupado com o uso de memoria para gerar os clones
    '0' = empty
    '1' = dark
    '2' = light */
class Board {

    constructor(size, state = [], dark = 0, light = 0) {
        this.dark = dark;
        this.light = light;

        this.size = size;
        this.state = [];

        if ( state.length == 0 ) {
            this.startState();
        }

        else {
            this.copyState(state);
        }

    }

    /* Clones the current board and returns a new one, with the exact same elements */
    cloneBoard() {
        return new Board(this.size, this.state, this.dark, this.light);
    }

    /* This method initiates the board with four pieces in the middle, 2 white and 2 black */
    startState() {
        let totalSize = this.size*this.size;

        for( let i = 0; i<totalSize; i++) {
            this.state[i] = '0';
        }

        let middle = this.size / 2;
        let point = new Point(middle - 1, middle - 1);

        console.log("hello!");
        this.addPiece('1', point);
        this.addPiece('1', point.addPoint(new Point(1,1)));
        this.addPiece('2', point.addPoint(new Point(0,1)));
        this.addPiece('2', point.addPoint(new Point(1,0)));  
    }

    /* Copies the current possitions of the pieces in "state" 
        and saves it in this.state*/
    copyState(state) {
        let totalSize = this.size*this.size;

        for( let i = 0; i<totalSize; i++) {
            this.state[i] = state[i];
        }
    }

    /* Transforms a coordinate, like (1, 2) into someting that an array can 
        "read". Example: (1,2) => 2*size of board + 1 */
    decodeCoordinates(point) {
        return point.y*this.size + point.x;
    }

    /* To be easier for the user to read and do debugging, this method transforms
        the saved pieces in char form to string form. ONLY TO BE USED FOR 
        DEBUGGIN, DO NOT USE IT ANYWHERE ELSE */
    decodePieceType(ch) {
        switch(ch) {
            case '0':
                return "empty";

            case '1':
                return "dark";

            case '2':
                return "light";

            default:
                return "empty";
        }
    }

    /* Print the current board and the number of darks and whites pieces! */
    debugBoard() {
        if ( this.state.length == 0 ) {
            console.log("Nothing yet!");
        }

        else {
            console.log("dark = "+this.dark+" light = "+this.light);

            let str = "";

            for( let i=0; i<this.size; i++ ) {
                for ( let j=0; j<this.size; j++ ) {
                    let temp = this.decodePieceType(this.state[this.decodeCoordinates(new Point(j, i))]);

                    if ( temp == "dark" ) { temp += " "}

                    str += temp;

                    if ( j!=this.size - 1 ) {
                        str += ',';
                    }
                }
                
                str += '\n';
            }

            console.log(str);
        }
    }

    /* This method adds a piece in possition "point". It does not check
        if it's occupied. It does however increse the counter of light and dark pieces 
        This method should not be used by the programmer directly!*/
    addPiece(type, point) {
        if ( type == '1' ) {
            this.dark++;
        }

        else if ( type == '2' ) {
            this.light++;
        }

        this.state[this.decodeCoordinates(point)] = type;
    }

    /*  This method subs a piece in possition "point". It does not check
        if it's occupied. It does however decreases the counter of light and dark pieces 
        This method should not be used by the programmer directly!*/
    rmPiece(point) {
        let type = this.state[this.decodeCoordinates(point)];

        if ( type == '1' ) {
            this.dark--;
        }

        else if ( type == '2' ) {
            this.light--;
        }

        this.state[this.decodeCoordinates(point)] = '0';
    }

    /* As the name suggest, it inverts the type of a piece. 
        Example: dark -> light, empty -> empty, light -> dark*/
    invertType(type) {
        switch( type ) {
            case '1':
                return '2';

            case '2':
                return '1';

            default :
                return '0';
        }
    }

    /* Get the type of the piece in possition "point". Becarefull with going out of bounds
        because this methods does not check it */
    getPiece(point) {
        if ( this.state.length == 0 ) {D
            return '0'
        }

        else
            return this.state[this.decodeCoordinates(point)];
    }


    /* Returns true if "point" is inside of the board*/
    insideBoard(point) {
        return point.x >= 0 && point.x < this.size && point.y >= 0 && point.y < this.size ? true: false;
    }

    /* This method will return true if the piece in possition "point" has the same 
        color as "type"*/
    inRange(type, point) {
        return this.insideBoard(point) && this.getPiece(point) == type ? true: false;
    }

    /* This method returns an array of pieces(points) to be flipped in a GIVEN 
        direction "vec"(vector). In case there isn't, it will return [] */
    getArrayOfPieces(type, point, vec) {
        let arr = [];
        let p = point.addPoint(vec);

        for ( ; this.inRange(type, p); p = p.addPoint(vec) ) {
            arr.push(p);
        }

        if ( this.insideBoard(p) && this.getPiece(p) == this.invertType(type) ) {
            return arr;
        }

        else {
            return [];
        }
    }

    /* Get all the flippable pieces from all directions */
    getAllflippablePieces(type, point) {
        let arr = [];
        let type1 = this.invertType(type);;

        for ( let i = -1; i<=1; i++ ) {
            if ( i != 0) {
                arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(i,0)));
                arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(0,i)));
                arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(i,i)));
                arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(i,-i)));
            }
        }

        return arr;
    }

    /* Flip a piece to color "type". It does not check if it exists */
    flipPiece(point, type) {
        this.rmPiece(point);
        this.addPiece(type, point);
    }

    /* Flips all the pieces in arrPoint to the new color "type" */
    flipArrayOfPieces(arrPoint, type) {
        for ( let i=0; i<arrPoint.length; i++ ) {
            this.flipPiece(arrPoint[i], type);
        }
    }

    /* Method will find and flip all possible pieces*/
    flipAllPieces(type, point) {
        let arr = this.getAllflippablePieces(type, point);

        this.flipArrayOfPieces(arr, type);
    }

    /* This method returns True if a possition is valid i.e the point is inside of the board and 
        the piece will flip some piece of the adversary. When i mean adversary, am referring 
        the pieces that have an inverse color to "type" */
    validPosstion(point, type) {
        return this.insideBoard(point) && this.getPiece(point) == '0' && this.getAllflippablePieces(type, point).length != 0 ? true: false;    
    }

    /* This method will clone the current board, then will flip the piece in "point" and flip
        all possible pieces that follows. It case of fail it will return the current board*/
    newPiece(type, point) {
        if ( !this.insideBoard(point) ) {
            console.log("point out of bounds");
            return this;
        }

        let newBoard = this.cloneBoard();

        newBoard.flipPiece(point,type);

        newBoard.flipAllPieces(type, point);

        return newBoard;
    }
}

/* Testing: to test do: node src/js/game.js */

function test() {
    board = new Board(10);
    board.debugBoard();

    board = board.newPiece('2', new Point(4, 3));
    board.debugBoard();
    board = board.newPiece('1', new Point(3, 3));
    board.debugBoard();
    board = board.newPiece('2', new Point(4, 2));
    board.debugBoard();
    board = board.newPiece('2', new Point(4, 1));
    board.debugBoard();
    board = board.newPiece('1', new Point(4, 0));
    board.debugBoard();
    board = board.newPiece('2', new Point(5, 6));
    board.debugBoard();
    board = board.newPiece('2', new Point(2, 2));
    board.debugBoard();
    board = board.newPiece('2', new Point(22, 2));
    board.debugBoard();

    console.log(board.validPosstion(new Point(3,3), '1')+(new Point(3,3).tostring()));
    console.log(board.validPosstion(new Point(4,6), '2')+(new Point(4,6).tostring()));
}

console.log(test());