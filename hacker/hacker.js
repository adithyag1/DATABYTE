document.addEventListener("DOMContentLoaded",function(){
    const grid=document.querySelector(".grid");
    const scorediv=document.querySelector(".score");
    const startbtn=document.querySelector(".startbtn");
    const timediv=document.querySelector(".time");
    const viewlb=document.getElementById("view-lb");
    const wrapper=document.querySelector(".wrapper");
    const lboard=document.querySelector(".leaderboard");
    const emojis=["😁", "❤️", "👑", "👩🏽‍💻", "🌸", "🌏", "🍎", "💎", "☀️", "🌙", "⭐", "🔍", "📚", "💧", "📱", "🦁", "📷", "😎", "🔥", "✨", "🦋", "💄", "🐮", "⛰️", "🍇", "💛", "🖋️","🌵"];
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
    let orders=[];``
    let clickok=true;
    let playername="";
    let sorted={};
    let rows;
    let cols;
    let paused=false;
    let leaderboard;
    let cards;
    let real,magic,dummy,bad=0;

    leaderboard=JSON.parse(localStorage.getItem("leaderboard"))||{};
        
    Object.keys(leaderboard)
    .sort((a,b)=>leaderboard[b]-leaderboard[a])
    .forEach(key=>{
        sorted[key] = leaderboard[key];
    });

    let lbhtm=`<table border><tr><th>Name</th><th>Score</th></tr>`;
    for(const [name,score] of Object.entries(sorted)){
        lbhtm+=`<tr><td>${name}</td><td>${score}</td></tr>`;
    }
    lbhtm+=`</table>`;
    lboard.innerHTML=lbhtm;

    nameform.addEventListener("submit",function(event){
        event.preventDefault();
        if(!started){
            playername=document.getElementById("name").value;
            rows=document.getElementById("rows").value||6;
            cols=document.getElementById("cols").value||6;
            while(orders.length<rows*cols){
                let ran=Math.floor(Math.random()*rows*cols+1);
                if(!orders.includes(ran)) orders.push(ran);
            }
            const difficulty=document.getElementById("difficulty").value;
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
            real=real%2?real-1:real;
            magic=magic>=2?magic:2;
            magic=magic%2?magic-1:magic;
            dummy=rows*cols-real-magic-bad;
    
            let htm="";
            for(let i=0;i<magic;i+=2){
                htm+=`<div class="card" data-id="100">
                        <div class="front" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin; background-color: lightgreen;">➕</div>
                        <div class="back" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin;">?</div>
                    </div>`
                htm+=`<div class="card" data-id="101">
                        <div class="front" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin;  background-color: lightgreen;">⏰</div>
                        <div class="back" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin;">?</div>
                    </div>`    
            }
            for(let i=2; i<real+2;i++){
                htm+=`<div class="card" data-id="${Math.floor(i/2)}">
                        <div class="front" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin;">${emojis[Math.floor(i/2)-1]}</div>
                        <div class="back" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin;">?</div>
                    </div>`;
            }
            for(let i=0;i<dummy;i++){
                htm+=`<div class="card" data-id="99">
                        <div class="front" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin;"></div>
                        <div class="back" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin;">?</div>
                    </div>`;
            }
            for(let i=0;i<bad;i+=2){
                htm+=`<div class="card" data-id="102">
                        <div class="front" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin; background-color: red;">➕</div>
                        <div class="back" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin;">?</div>
                    </div>`
                htm+=`<div class="card" data-id="103">
                        <div class="front" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin;  background-color: red;">⏰</div>
                        <div class="back" style="font-size: ${0.9*Math.min(75/rows,75/cols)}vmin;">?</div>
                    </div>`    
            }
            grid.innerHTML=htm;
            grid.style.height=`75vmin`;
            grid.style.width=`75vmin`;
            cards=document.querySelectorAll(".card");
            let ord=0;
            cards.forEach((card)=>{
                card.addEventListener("click",flipfn);
                card.style.order=orders[ord++];
                card.style.height=`${75/rows}vmin`;
                card.style.width=`${75/cols}vmin`;
            });
        }
        else return;
    });

    function gameover(num){
        clearInterval(timeinterval);
        if(playername in leaderboard) leaderboard[playername]=Math.max(score,leaderboard[playername]);
        else leaderboard[playername]=score;
        localStorage.setItem("leaderboard",JSON.stringify(leaderboard));
        setTimeout(() => {
            cards.forEach(card => {
                this.removeEventListener("click",flipfn);
                card.classList.add("flip");
            });            
        }, 501);
        setTimeout(() => {
            switch(num){
                case 1:
                    alert(`Congratulations! You win.\nTime taken: ${60-time}s`);
                    break;
                case 0:
                    alert(`Time Up! Your score:${score}`);
                    break;
            }
            location.reload();
            
        }, 1002);
    }

    function shuffle(){
        for (let i=orders.length-1;i>0;i--){
            const randomIndex=Math.floor(Math.random()*(i+1));
            [orders[i],orders[randomIndex]]=[orders[randomIndex],orders[i]];
        }
        let x=0;
        cards.forEach((card)=>{
            if(!card.classList.contains("locked")) card.style.order = orders[x++];
        });
    }
  
    function flipfn(){
        if(started&&clickok&&time){

            if(this===card1) return;
            if(card1&&card2) return;

            this.classList.add("flip");

            if(this.dataset.id==="99"){
                this.removeEventListener("click",flipfn);
                this.classList.add("locked");
                for(let i=0;i<orders.length;i++){
                    if(!(orders[i]-this.style.order)){
                        orders.splice(i--,1);
                    }
                }
                return;
            }

            else if(this.dataset.id==="100"){
                if(bad) score+=2;
                else score++;
                scorediv.innerHTML=`🎯:${score}`;
                clickok=false;
                setTimeout(()=> {
                    this.classList.remove("flip");
                    setTimeout(()=>{
                        shuffle();
                        clickok=true;
                    },300);
                }, 500);
                return;
            }              
            else if(this.dataset.id==="101"){
                clickok=false;
                setTimeout(()=> {
                    this.classList.remove("flip");
                    setTimeout(()=>{
                        shuffle();
                        clickok=true;
                    },300);
                }, 500);
                if(!paused&&time){
                    paused=true;
                    clearInterval(timeinterval);
                    pausetimeout=setTimeout(() => {
                        timeinterval=setInterval(()=>{
                        if(--time<0) return gameover(0);
                        timediv.innerHTML=`⏰:${time}`;
                        },1000);
                        paused=false;
                    },5000);
                }
                else if(paused){
                    clearTimeout(pausetimeout);
                    pausetimeout=setTimeout(() => {
                        timeinterval=setInterval(()=>{
                        if(--time<0) return gameover(0);
                        timediv.innerHTML=`⏰:${time}`;
                        },1000);
                        paused=false;
                    },5000);

                }
                return;
            }

            else if(this.dataset.id==="102"){
                if(score) score--;
                scorediv.innerHTML=`🎯:${score}`;
                clickok=false;
                setTimeout(()=> {
                    this.classList.remove("flip");
                    setTimeout(()=>{
                        shuffle();
                        clickok=true;
                    },300);
                }, 500);
                return;
            }              
            else if(this.dataset.id==="103"){
                clickok=false;
                setTimeout(()=> {
                    this.classList.remove("flip");
                    setTimeout(()=>{
                        shuffle();
                        clickok=true;
                    },300);
                }, 500);
                time-=3;
                return;
            }

            if(!flipped){
                flipped=true;
                card1=this;
                card1.classList.add("locked");
                return;
            }

            card2=this;
            flipped=false;

            if(card1.dataset.id===card2.dataset.id){
                if(card1&&card2){
                    card1.removeEventListener("click",flipfn);
                    card2.removeEventListener("click",flipfn);
                    card1.classList.add("locked");
                    card2.classList.add("locked");
                    for(let i=0;i<orders.length;i++){
                        if(!(orders[i]-card1.style.order)){
                            orders.splice(i--,1);
                        }
                        if(!(orders[i]-card2.style.order)){
                            orders.splice(i--,1);
                        }
                    }
                    scorediv.innerHTML=`🎯:${++score}`;
                    wobonus++;
                    if(wobonus>=Math.floor(real/2)){
                        setTimeout(()=>{
                            return gameover(1);
                        },500);
                    }
                }
                card1=null;
                card2=null;
            }
            else{
                clickok=false;
                card1.classList.remove("locked");
                setTimeout(()=>{
                    card1.classList.remove("flip");
                    card2.classList.remove("flip");
                    setTimeout(()=>{
                        shuffle();
                        clickok=true;
                    },300);
                    card1=null;
                    card2=null;
                },500);
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
                if(--time<0) return gameover(0);
                timediv.innerHTML=`⏰:${time}`;
            },1000);
        }
        else{
            alert("Enter player name!");
        }
    }
    
    viewlb.onclick=()=>{
        if(lboard.style.display==="none"){
            lboard.style.display="block";
            wrapper.style.display="none";
            nameform.style.display="none";
        }
        else{
            lboard.style.display="none";
            wrapper.style.display="block";
            nameform.style.display="block";
        }
    }
});