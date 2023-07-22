document.addEventListener("DOMContentLoaded", function(){
	
    const grid=document.querySelector(".grid");
    const scorediv=document.querySelector(".score");
    const startbtn=document.querySelector(".startbtn");
    const timediv=document.querySelector(".time");
    const viewlb=document.getElementById("view-lb");
    const wrapper=document.querySelector(".wrapper");
    const easyQuerySel=document.querySelector(".leaderboardEasy");
    const medQuerySel=document.querySelector(".leaderboardMed");
    const hardQuerySel=document.querySelector(".leaderboardHard");
    const leaderboardQuerySel=document.querySelector(".leaderboard");
    const emojis=["😁", "❤️", "👑", "👩🏽‍💻", "🌸", "🌏", "🍎", "💎", "☀️", "🌙", "⭐", "🔍", "📚", "💧", "📱", "🦁", "📷", "😎", "🔥", "✨", "🦋", "💄", "🐮", "⛰️", "🍇", "💛", "🖋️", "🌵"];
    const nameform=document.getElementById("nameform");

    let flipped=false;
    let card1=null;
    let card2=null;
    let started=false;
    let time=60;
    let score=0;
    let wobonus=0;
    let timeinterval;
    let pausetimeout;
    let orders=[];
    let clickok=true;
    let playername="";
    let sorted={};
    let rows;
    let cols;
    let paused=false;
    let easyArray=[];
    let medArray=[];
    let hardArray=[];
    let cards;
    let difficulty;
    let real,magic,dummy,bad=0;

	//get leaderboards from localStorage

    easyArray=JSON.parse(localStorage.getItem("leaderboardEasy"));
    if(easyArray===null) easyArray=[];

    medArray=JSON.parse(localStorage.getItem("leaderboardMed"));
    if(medArray===null) medArray=[];

    hardArray=JSON.parse(localStorage.getItem("leaderboardHard"));
    if(hardArray===null) hardArray=[];

	//display in descending order of score

    easyArray.sort((a, b)=>b.score - a.score);
    let easyhtm=`<table border><caption>Easy</caption><tr><th>Name</th><th>Grid</th><th>Score</th></tr>`;
    easyArray.map((obj)=>{
        easyhtm+=`<tr><td>${obj.name}</td><td>${obj.grid}</td><td>${obj.score}</td></tr>`;
    });
    easyhtm+=`</table>`;
    easyQuerySel.innerHTML=easyhtm;

    medArray.sort((a, b)=>b.score - a.score);
    let medhtm=`<table border><caption>Medium</caption><tr><th>Name</th><th>Grid</th><th>Score</th></tr>`;
    medArray.map((obj)=>{
        medhtm+=`<tr><td>${obj.name}</td><td>${obj.grid}</td><td>${obj.score}</td></tr>`;
    });
    medhtm+=`</table>`;
    medQuerySel.innerHTML=medhtm;

    hardArray.sort((a, b)=>b.score - a.score);
    let hardhtm=`<table border><caption>Hard</caption><tr><th>Name</th><th>Grid</th><th>Score</th></tr>`;
    hardArray.map((obj)=>{
        hardhtm+=`<tr><td>${obj.name}</td><td>${obj.grid}</td><td>${obj.score}</td></tr>`;
    });
    hardhtm+=`</table>`;
    hardQuerySel.innerHTML=hardhtm;

	//generate grid on submitting form

    nameform.addEventListener("submit", function(event){
        event.preventDefault();
        if(!started){
            playername=document.getElementById("name").value;
            rows=document.getElementById("rows").value || 6;
            cols=document.getElementById("cols").value || 6;
            while(orders.length < rows*cols){
                let ran=Math.floor(Math.random()*rows*cols + 1);
                if(!orders.includes(ran)) orders.push(ran);
            }
            difficulty=document.getElementById("difficulty").value;

			//calculate number of real,magic,dummy,bad cards wrt difficulty

            switch(difficulty){
                case "easy":
                    real=Math.floor(rows*cols*0.8);
                    magic=Math.floor(rows*cols*0.15);
                    break;
                case "medium":
                    real=Math.floor(rows*cols*0.85);
                    magic=Math.floor(rows*cols*0.1);
                    break;
                case "hard":
                    real=Math.floor(rows*cols*0.8);
                    magic=Math.floor(rows*cols*0.1);
                    bad=2;
                    break;
            }
            real=real % 2 ? real - 1 : real;
            magic=magic >=2 ? magic : 2;
            magic=magic % 2 ? magic - 1 : magic;
            dummy=rows*cols - real - magic - bad;

			//add cards to html

            let htm="";
            for(let i=0; i < magic; i+=2){
                htm+=`<div class="card" data-id="100">
                            <div class="front" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin; background-color: lightgreen;">➕</div>
                            <div class="back" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin;">?</div>
                    	</div>`;
                htm+=`<div class="card" data-id="101">
                        	<div class="front" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin; background-color: lightgreen;">⏰</div>
                        	<div class="back" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin;">?</div>
                    	</div>`;
            }

            for(let i=2; i < real + 2; i++){
                htm+=`<div class="card" data-id="${Math.floor(i / 2)}">
                        	<div class="front" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin;">${emojis[Math.floor(i / 2) - 1]}</div>
                        	<div class="back" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin;">?</div>
                    	</div>`;
            }

            for(let i=0; i < dummy; i++){
                htm+=`<div class="card" data-id="99">
                        	<div class="front" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin;"></div>
                        	<div class="back" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin;">?</div>
                        </div>`;
            }

            for(let i=0; i < bad; i+=2){
                htm+=`<div class="card" data-id="102">
                        	<div class="front" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin; background-color: red;">➕</div>
                        	<div class="back" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin;">?</div>
                        </div>`;
                htm+=`<div class="card" data-id="103">
                        	<div class="front" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin; background-color: red;">⏰</div>
                        	<div class="back" style="font-size: ${0.9*Math.min(75 / rows, 75 / cols)}vmin;">?</div>
                        </div>`;
            }

            grid.innerHTML=htm;
            grid.style.height=`75vmin`;
            grid.style.width=`75vmin`;
            cards=document.querySelectorAll(".card");
            let ord=0;
            cards.forEach((card)=>{
                card.addEventListener("click", flipfn);
                card.style.order=orders[ord++];
                card.style.height=`${75 / rows}vmin`;
                card.style.width=`${75 / cols}vmin`;
            });
        }
        else return;
    });

    function gameover(num){
        clearInterval(timeinterval);
		switch(num){
			case 1:
				sound(1400,500);
				break;
			case 0:
				sound(400,500);
				break;
		}

        const leaderboardObj={
            name: playername,
            grid: `${rows}x${cols}`,
            diff: difficulty,
            score: score,
        };

		//setItems of leaderboards in localStorage
        if(difficulty==="easy"){
            const filtered=easyArray.filter((obj)=>obj.name==playername&&obj.grid===`${rows}x${cols}`);
            if(filtered.length>0){
                let index=easyArray.indexOf(filtered[0]);
                easyArray[index].score=Math.max(score,easyArray[index].score);
            }
            else{
                easyArray.push(leaderboardObj);
                localStorage.setItem("leaderboardEasy", JSON.stringify(easyArray));
            }
        }
        else if(difficulty==="medium"){
            const filteredMed = medArray.filter((obj, ind) => obj.name === playername && obj.grid === `${rows}x${cols}`);
            if (filteredMed.length > 0) {
                let index = medArray.indexOf(filteredMed[0]);
                medArray[index].score = Math.max(score, medArray[index].score);
            }
            else {
                medArray.push(leaderboardObj);
                localStorage.setItem("leaderboardMed", JSON.stringify(medArray));
            }
        }
        else if(difficulty==="hard"){
            const filteredHard = hardArray.filter((obj, ind) => obj.name === playername && obj.grid === `${rows}x${cols}`);
            if (filteredHard.length > 0) {
                let index = hardArray.indexOf(filteredHard[0]);
                hardArray[index].score = Math.max(score, hardArray[index].score);
            }
            else {
                hardArray.push(leaderboardObj);
                localStorage.setItem("leaderboardHard", JSON.stringify(hardArray));
            }
        }

		//reveal all cards in the end
        cards.forEach((card)=>{
            this.removeEventListener("click", flipfn);
        });
        setTimeout(()=>{
			cards.forEach((card)=>{
				card.classList.add("flip");
			})
        }, 501);
        setTimeout(()=>{
			
            switch(num){
                case 1:
                    alert(`Congratulations! You win.\nTime taken: ${60 - time}s`);
                    break;
                case 0:
                    alert(`Time Up! Your score:${score}`);
                    break;
            }
            location.reload();
        }, 1002);
    }

	//randomly shuffle cards which are not locked

    function shuffle(){
        for(let i=orders.length - 1; i > 0; i--){
            const randomIndex=Math.floor(Math.random() *(i + 1));
            [orders[i], orders[randomIndex]]=[orders[randomIndex], orders[i]];
        }
        let x=0;
        cards.forEach((card)=>{
            if(!card.classList.contains("locked")) card.style.order=orders[x++];
        });
    }

	//sound generation

	function sound(freq,time){
		let ctx=new AudioContext();
		let osc=ctx.createOscillator();
		osc.type="sine";
		osc.frequency.value=freq;
		osc.connect(ctx.destination);
		osc.start();
		setTimeout(function(){
			osc.stop();
		},time);
	}

    function flipfn(){
        if(started&&clickok&&time){
            if(this===card1) return;//clicking on same card case
            if(card1&&card2) return;//if the are not null

            this.classList.add("flip");

			//dummy card
            if(this.dataset.id==="99"){
				sound(800,100);
                this.removeEventListener("click", flipfn);
                this.classList.add("locked");
                for(let i=0; i < orders.length; i++){
                    if(!(orders[i] - this.style.order)){
                        orders.splice(i, 1);
                    }
                }
                return;
            }

			//score powerup
            else if(this.dataset.id==="100"){
				sound(1400,300);
                if(bad) score+=2;
                else score++;
                scorediv.innerHTML=`🎯:${score}`;
                clickok=false;
                setTimeout(()=>{
                    this.classList.remove("flip");
                    setTimeout(()=>{
                        shuffle();
                        clickok=true;
                    }, 300);
                }, 500);
                return;
            }

			//time freezer
            else if(this.dataset.id==="101"){
				sound(1400,300);
                clickok=false;
                setTimeout(()=>{
                    this.classList.remove("flip");
                    setTimeout(()=>{
                        shuffle();
                        clickok=true;
                    }, 300);
                }, 500);
                if(!paused&&time){
                    paused=true;
                    clearInterval(timeinterval);
                    pausetimeout=setTimeout(()=>{
                        timeinterval=setInterval(()=>{
                            if(--time < 0) return gameover(0);
                            timediv.innerHTML=`⏰:${time}`;
                        }, 1000);
                        paused=false;
                    }, 5000);
                }
				//when a second time freeze card comes when time is already frozen, fresh 5 seconds freeze
                else if(paused){
                    clearTimeout(pausetimeout);
                    pausetimeout=setTimeout(()=>{
                        timeinterval=setInterval(()=>{
                            if(--time < 0) return gameover(0);
                            timediv.innerHTML=`⏰:${time}`;
                        }, 1000);
                        paused=false;
                    }, 5000);
                }
                return;
            }

			//negative score card
            else if(this.dataset.id==="102"){
				sound(400,300);
                if(score) score--;
                scorediv.innerHTML=`🎯:${score}`;
                clickok=false;
                setTimeout(()=>{
                    this.classList.remove("flip");
                    setTimeout(()=>{
                        shuffle();
                        clickok=true;
                    }, 300);
                }, 500);
                return;
            }

			//negative time card
            else if(this.dataset.id==="103"){
				sound(400,300);
                clickok=false;
                setTimeout(()=>{
                    this.classList.remove("flip");
                    setTimeout(()=>{
                        shuffle();
                        clickok=true;
                    }, 300);
                }, 500);
                time -=3;
                if(time <=0){
                    time=0;
                    timediv.innerHTML=`⏰:${time}`;
                    return gameover(0);
                }
                return;
            }

            if(!flipped){
				sound(800,100);
                flipped=true;
                card1=this;
                card1.classList.add("locked");
				for(let i=0; i < orders.length; i++){
					if(!(orders[i] - card1.style.order)){
						orders.splice(i, 1);
					}
				}
                return;
            }

            card2=this;
            flipped=false;

			//matching
            if(card1.dataset.id===card2.dataset.id){
				sound(1400,300);
                if(card1&&card2){
                    card1.removeEventListener("click", flipfn);
                    card2.removeEventListener("click", flipfn);
                    card1.classList.add("locked");
                    card2.classList.add("locked");
                    for(let i=0; i < orders.length; i++){
                        if(!(orders[i] - card1.style.order)){
                            orders.splice(i--, 1);
                        }
                        if(!(orders[i] - card2.style.order)){
                            orders.splice(i--, 1);
                        }
                    }
                    scorediv.innerHTML=`🎯:${++score}`;
                    wobonus++;
                    if(wobonus >=Math.floor(real / 2)){
                        setTimeout(()=>{
                            return gameover(1);
                        }, 500);
                    }
                }
                card1=null;
                card2=null;
            }

			//not matching
            else {
				sound(800,100);
                clickok=false;
                card1.classList.remove("locked");
				orders.push(card1.style.order);
                setTimeout(()=>{
                    card1.classList.remove("flip");
                    card2.classList.remove("flip");
                    setTimeout(()=>{
                        shuffle();
                        clickok=true;
                    }, 300);
                    card1=null;
                    card2=null;
                }, 500);
            }
        }
    }

    startbtn.onclick=()=>{
        if(playername!==""){
            if(started){
                clearInterval(timeinterval);
                location.reload();
            }
            started=true;
            startbtn.innerHTML="Restart";
            timeinterval=setInterval(()=>{
                if(--time < 0) return gameover(0);
                timediv.innerHTML=`⏰:${time}`;
            }, 1000);
        }
        else {
            alert("Enter details and submit!");
        }
    };

	//on clicking leaderboard, show it and hide the rest, vice versa
    viewlb.onclick=()=>{
        if(leaderboardQuerySel.style.display==="none"){
            leaderboardQuerySel.style.display="flex";
            leaderboardQuerySel.style.justifyContent="space-around";
            wrapper.style.display="none";
            nameform.style.display="none";
        }
        else {
            leaderboardQuerySel.style.display="none";
            wrapper.style.display="block";
            nameform.style.display="block";
        }
    };
});
