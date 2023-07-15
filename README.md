# databyte-task1

This is a cards game website done for the first task of induction into DataByte club, NITT
It has a grid where the user decides number of rows and columns.
There are three difiiculty levels easy, medium and hard.

Number of real and magic cards change according to the difficulty level.
Easy level has more magic cards than medium.
Hard level also has some negative cards.

Magic Cards:
  Bonus: increases score by 1 in easy and medium and by 2 in hard mode.
  Freeze: freezes the timer for 5 seconds
Bad cards:
  Negative score: decreases score by 1.
  Negative time: decreases time by 3 seconds.
  
Apart from this, there are dummy and real cards.
Dummy cards are empty and just disppear on click.
Real cards have visuals behind them. Emojis are used here.

When a card is clicked, its content is revealed.
This is done by using transform property in css. The card is rotated by 180 degrees along y axis.

Since question marks and emojis are text and utf characters, select is disabled in css.

For real cards, If two images are the same, the player scores a point.
If they are different, the shuffle function is called, which randomly shuffles all cards which are not locked.
Cards which have already been revealed and dummy cards are considered as locked. "locked" is added to their classList to identify this.

There are three different leaderboards: one for each difficulty level.
Each leaderboard contains the name, grid size and maximum score of the player.
Newplayers' scores are simply added to the table, while pre-existing players' scores are updated if higher.
The view leaderboard button shows leaderboard while hiding the other parts of the page.
On clicking again, the exact opposit happens.

A beep sound appears for 0.1 second on each fruitful click, 0.3 seconds on magic and bad cards and 0.5 seconds on game end.
It is done by creating and oscillator using createOscillator() function.
High frequency sound is produced for positive results such as matching cards, winning, or bonus from magic cards.
Negative cards and timer out give low frequency sounds.

When all real cards are flipped or the timer runs out, the gameover(num) function is called.
gameover(0) is for time over, and gameover(1) for winning the game.
All cards are revealed at the end.
