class Point {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }

    /* Add point and return a new added point */
    addPoint(point) {
        return new Point(this.x + point.x, this.y + point.y);
    }

    toString() {
        return "(" + this.x + "," + this.y+ ")";
    }

    toArrayIndex(size) {
        return (this.y * size + this.x);
    }
}


/*  0 = empty
    1 = dark
    2 = light */
class Board {
    constructor(size, state = null, currentPlayer = 1, dark = 0, light = 0) {
        this.dark = dark;
        this.light = light;
        this.currentPlayer = currentPlayer;

        this.size = size;
        this.state = [];

        if (!state) {
            this.startState();
        } else {
            this.state = [...state];
        }
    }

    score(type) {
        if (type === 1) {
            return this.dark;
        } else if(type === 2) {
            return this.light;
        }

        return 0;
    }

    /* Clones the current board and returns a new one, with the exact same elements */
    cloneBoard() {
        return new Board(this.size, this.state, this.dark, this.light);
    }

    /* This method initiates the board with four pieces in the middle, 2 white and 2 black */
    startState() {        
        for (let i = 0; i < this.size * this.size; i++) this.state[i] = 0;

        let middle = this.size / 2;
        let point = new Point(middle - 1, middle - 1);

        this.addPiece(1, point);
        this.addPiece(1, point.addPoint(new Point(1,1)));
        this.addPiece(2, point.addPoint(new Point(0,1)));
        this.addPiece(2, point.addPoint(new Point(1,0)));
    }

    /* This method adds a piece in possition "point". It does not check
        if it's occupied. It does however increse the counter of light and dark pieces */
    addPiece(type, point) {
        if (type === 1) {
            this.dark++;
        } else if (type === 2) {
            this.light++;
        }

        this.state[point.toArrayIndex(this.size)] = type;
    }

    /*  This method removes a piece in possition "point". It does not check
        if it's occupied. It does however decrease the counter of light and dark pieces */
    removePiece(point) {
        let type = this.getPiece(point);

        if ( type === 1 ) {
            this.dark--;
        }

        else if ( type === 2 ) {
            this.light--;
        }

        this.state[point.toArrayIndex(this.size)] = 0;
    }

    /* As the name suggests, it inverts the type of a piece. 
        Example: dark -> light, empty -> empty, light -> dark*/
    invertType(type) {
        switch( type ) {
            case 1:
                return 2;
            case 2:
                return 1;
            default:
                return 0;
        }
    }

    /* Get the type of the piece in position "point". Be careful with going out of bounds
        because this methods does not check it */
    getPiece(point) {
        if (this.state.length === 0) 
            return 0
        else
            return this.state[point.toArrayIndex(this.size)];
    }

    getPieceName(point) {
        switch (this.getPiece(point)) {
            case 0:
                return "empty";
            case 1:
                return "dark";
            case 2:
                return "light";
        }
    }

    /* Returns true if "point" is inside of the board*/
    insideBoard(point) {
        return point.x >= 0 && point.x < this.size && point.y >= 0 && point.y < this.size;
    }

    /* This method will return true if the piece in position "point" has the same 
        color as "type"*/
    inRange(type, point) {
        return this.insideBoard(point) && this.getPiece(point) == type;
    }

    /* This method returns an array of pieces(points) to be flipped in a GIVEN 
        direction "vec"(vector). In case there isn't, it will return [] */
    getArrayOfPieces(type, point, vec) {
        let arr = [];
        let p = point.addPoint(vec);

        for (; this.inRange(type, p); p = p.addPoint(vec)) {
            arr.push(p);
        }

        if (this.insideBoard(p) && this.getPiece(p) == this.invertType(type)) {
            return arr;
        } else {
            return [];
        }
    }

    /* Get all the flippable pieces from all directions */
    getAllFlippablePieces(type, point) {
        let arr = [];
        let type1 = this.invertType(type);

        [-1, 1].forEach(i => {
            arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(i, 0)));
            arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(0, i)));
            arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(i, i)));
            arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(i, -i)));
        });

        return arr;
    }

    /* Flip a piece to color "type". It does not check if it exists */
    flipPiece(point, type) {
        this.removePiece(point);
        this.addPiece(type, point);
    }

    /* Method will find and flip all possible pieces*/
    flipAllPieces(type, point) {
        let arr = this.getAllFlippablePieces(type, point);

        arr.forEach(point => this.flipPiece(point, type));
    }

    /* This method returns True if a position is valid i.e the point is inside of the board and 
        the piece will flip some piece of the adversary. When I mean adversary, am referring 
        to pieces that have an inverse color to "type" */
    validPosition(point, type) {
        return type === this.currentPlayer && this.insideBoard(point) && this.getPiece(point) === 0 && this.getAllFlippablePieces(type, point).length > 0;    
    }

    /* This method will clone the current board, then will flip the piece in "point" and flip
        all possible pieces that follows. It case of fail it will return null */
    newPiece(type, point) {
        if (!this.validPosition(point, type)) {
            return null;
        }

        let newBoard = this.cloneBoard();

        newBoard.flipPiece(point, type);

        newBoard.flipAllPieces(type, point);

        newBoard.currentPlayer = this.invertType(type);

        return newBoard;
    }
}