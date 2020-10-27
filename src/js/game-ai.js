class AIPlayer {
    constructor(maxDepth, type) {
        this.maxDepth = maxDepth;
        this.type = type;
    }

    // Wrapper for simple usage
    calculateNextMove(board) {
        return this._minimax(board);
    }

    _minimax(board, depth = 0, playing = true, alpha = -100000, beta = 100000) {
        if (depth >= this.maxDepth) {
            return board.score(this.type) - board.score(invertType(this.type));
        }

        let moves = board.getPossibleMoves(playing ? this.type : invertType(this.type));
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