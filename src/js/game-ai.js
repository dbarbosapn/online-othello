class AIPlayer {
    constructor(maxDepth, type) {
        this.maxDepth = maxDepth;
        this.type = type;
    }

    getPossibleMoves(board) {
        let moves = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (board.validPosition(new Point(i, j), this.type))
                    moves.push(board.newPiece(this.type, new Point(i, j)));
            }
        }

        return moves;
    }

    inverseType() {
        if (this.type === 1) return 2;
        return 1;
    }

    // Wrapper for simple usage
    calculateNextMove(board) {
        return this._minimax(board);
    }

    _minimax(board, depth = 0, playing = true, alpha = -100000, beta = -100000) {
        if (depth >= this.maxDepth) {
            return board.score(this.type) - board.score(this.inverseType());
        }

        let moves = this.getPossibleMoves(board);
        let bestMove;

        if (playing) {
            moves.some(move => {
                let score = this._minimax(move, depth + 1, !playing, alpha, beta);

                if (score > alpha) {
                    alpha = score;
                    bestMove = move;
                }

                return (beta <= alpha);
            });

            if (depth === 0) {
                return bestMove;
            } else {
                return alpha;
            }
        } else {
            let min = 100000;
            moves.some(move => { 
                let score = this._minimax(move, depth + 1, !playing, alpha, beta);

                if (score < beta) {
                    beta = score;
                }

                return (beta <= alpha);
            });

            return beta;
        }
    }
}