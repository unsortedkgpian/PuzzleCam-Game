let VIDEO= null;
let CONTEXT = null;
let CANVAS = null;
// we need some space left all around it so we can move the pieces
let SCALER=0.8;
let SIZE ={x:0,y:0,width:0,height:0,rows:3,columns:3};
let PIECES = [];
// we need to create the global variable so ve can keep the track of gloabal variable


// we need some time variable to get the time
let START_TIME= null;
let END_TIME= null;

function main(){
    console.log("main");// to check main funtion is working or not


    // Now have to give the some width and space for image
    CANVAS= document.getElementById("myCanvas");
    CONTEXT= CANVAS.getContext("2d");
    // No we have to add some event listeners no we can make the point 
    addEventListener();


    let promise= navigator.mediaDevices.getUserMedia({video:true});


    promise.then(function(signal){

        VIDEO=document.createElement("video");// make a new element of video
        // using dom manipution to create a new element of video in html
        VIDEO.srcObject=signal;
        VIDEO.play();

        VIDEO.onloadeddata=function(){
            handleResize();

            initializePieces();
            // it will make the pieceso of video
            window.addEventListener('resize', handleResize);
            updateGame();
        }
    }).catch(function(err){
        alert("Camera error: "+ err);// to show when it is not working
    });
}



// we have to give some feature to diffculaty funtion in html
function setDifficulty(){
    let diff= document.getElementById("difficulty").value;
    switch(diff){
        case "easy":
            initializePieces(3,3);
            break;
        
        case "medium":
            initializePieces(5,5);
            break;
        
        case "hard":
            initializePieces(10,10);
            break;
        
        case "insane":
            initializePieces(40,25);
            break;
        
    }
}



function restart(){
    START_TIME=new Date().getTime();
    END_TIME=null;
    randommizePieces();
    document.getElementById("menuItems").style.display="none";
}


function updateTime(){
    let now = new Date().getTime;

    if(START_TIME!=null){
        if(END_TIME!=null){
        document.getElementById("time").innerHTML=fromatTime(END_TIME-START_TIME);
        }else{
            document.getElementById("time").innerHTML=fromatTime(now-START_TIME);
        }
    }
}


function fromatTime(milliseconds){
    let seconds=Math.floor(milliseconds/1000);
    let s= Math.floor(seconds%60);
    let m= Math.floor((seconds%(60*60))/60);
    let h=Math.floor((seconds%(60*60*24))/(60*60));

    let formattedTime=h.toString().padStart(2,'0');
    formattedTime+=":";
    formattedTime+=m.toString().padStart(2,'0');
    formattedTime+=":";
    formattedTime+=s.toString().padStart(2,'0');

    return formattedTime;
}


function isComplete(){
    for(let i=0;i<PIECES.length;i++){
        if(PIECES[i].correct==false){
            return false;
        }
    }
    return true;
}








// We have to make the Event Linster some funtion for to Drag and grop
//MouseDown is click event
// MouseMove is pressing the the piece and moving the cursesor
// MouseUp is releasing the press button
function addEventListener(){
    CANVAS.addEventListener("mousedown",onMouseDown);
    CANVAS.addEventListener("mousemove",onMouseMove);
    CANVAS.addEventListener("mouseup",onMouseUp);

    // on mobile devices it wont work because it work on tochevent
    CANVAS.addEventListener("touchstart",onTouchStart);
    CANVAS.addEventListener("touchmove",onTouchMove);
    CANVAS.addEventListener("touchend",onTouchEnd);
}
// we need to create the seperate funtion where we need to move the selected pieces
function onMouseDown(evt){
    SELECTED_PIECE=getPressedPiece(evt);
    if(SELECTED_PIECE!=null){
        // there is some issu on clicking the piece it goes downwords of other piece so to rem
        // it we need some thing
        const index = PIECES.indexOf(SELECTED_PIECE);
        if(index>-1){
            PIECES.splice(index,1);
            PIECES.push(SELECTED_PIECE);
        }

        SELECTED_PIECE.offset={
            x:evt.x-SELECTED_PIECE.x,
            y:evt.y-SELECTED_PIECE.y
        }
        SELECTED_PIECE.correct=false;
    }
}
function onMouseMove(evt){
    SELECTED_PIECE=getPressedPiece(evt);
    if(SELECTED_PIECE!=null){
        SELECTED_PIECE.x=evt.x-SELECTED_PIECE.offset.x;
        SELECTED_PIECE.y=evt.y-SELECTED_PIECE.offset.y;
    }
}

function onMouseUp(evt){
    // Now if piece is closed to where it should be so we have to make shuch when it is release 
    // it automaticaly goes to its original location so


    // It give proper feedback
    // Make game actully playable

    if(SELECTED_PIECE.isClose()){
        SELECTED_PIECE.snap();
        if(isComplete() && END_TIME == null){
            let now= new Date().getTime();
            END_TIME=now;
        }
    }
    SELECTED_PIECE= null;
}


function onTouchStart(evt){
    let loc={x:evt.touches[0].clientX,
        y:evt.touches[0].clientY};
    onMouseDown(loc);
}


function onTouchMove(evt){
    let loc={x:evt.touches[0].clientX,
        y:evt.touches[0].clientY};
    onMouseMove(loc);
}


function onTouchEnd(evt){
    // let loc={x:evt.touches[0].clientX,
    //     y:evt.touches[0].clientY};
    // onMouseUp(loc);
    onMouseUp();
}







// How to find the user pressed the piecesi or not
// So we need a funtion to find out which event is selected amoung all the pieces
function getPressedPiece(loc){
    //When we select multiple pices lower most pices is selected we can reverse the 
    // array so it can chose abvoe most
    for(let i=PIECES.length-1;i>=0;i--){
        if(loc.x>PIECES[i].x && loc.x<PIECES[i].x + PIECES.width &&
            loc.y>PIECES[i].y && loc.y<PIECES[i].y +PIECES[i].height){
                return PIECES[i];
            }
    }
    return null;
}




function handleResize(){
    let resizer=SCALER*Math.min(widow.innerWidth/VIDEO.videoWidth, window.innerHeight/VIDEO.videoHeight);
    SIZE.width=resizer*VIDEO.videoWidth;
    SIZE.height= resizer*VIDEO.videoHeight;
    SIZE.x=window.innerWidth/2 - SIZE.width/2;
    SIZE.y=window.innerHeight/2 - SIZE.height/2;
    CANVAS.width=window.innerWidth;
    CANVAS.height=window.innerHeight;
}


function updateGame(){
    // we have made the piece at diffiernet location but we have to clear the inital value
    CONTEXT.clearReact(0,0, CANVAS.width, CANVAS.height);
    //Now we need some rough idea about where the piece want to goo 
    // so we are making a 2 image where one will be shadow type
    CONTEXT.globalAlpha= 0.5;// It will make the video behind it semi parmanent

    CONTEXT.drawImage(VIDEO,SIZE.x, SIZE.y,SIZE.width,SIZE.height);

    CONTEXT.globalAlpha= 1;// it will  make the pices parmanent

    // Now we have to draw the pieces on the video so
    for(let i=0;i<PIECES.length;i++){
        PIECES[i].draw(CONTEXT);
    }
    updateTime();
    // After all we can just see one time image and we have to reload for n
    //next fig so we have to update the frame as fast as my web cam can
    window.requestAnimationFrame(updateGame);
    
}

function initializePieces(rows,cols){
    // now we have to make to any no of rows and cols using 
    //this 
    SIZE.rows=rows;
    SIZE.columns=cols;
    PIECES=[];
    // Now we have push the multiple picecinto array so we can make77777
    for(let i=0;i<SIZE.rows;i++){
        for(let j=0;j<SIZE.columns;j++){
            PIECES.push(new Piece(i,j));
        }
    }
}
// we have to make a funtion which ramdom the piece to diffiernet location
function randommizePieces(){
    for(let i=0;i<PIECES.length;i++){
        let loc = {
            x : Math.random()*(CANVAS.width-PIECES[i].width), 
            y: Math.random()*(CANVAS.height-PIECES[i].height)
         }
         PIECES[i].x = loc.x;
         PIECES[i].y = loc.y;
         PIECES[i].correct=false;
        };
}





class Piece{// it is done to make multiple pieces on the cam so we cam diveide
    // its makeing the class of pieces

    constructor(rowIndex,colIndex){
        this.rowIndex=rowIndex;
        this.colIndex=colIndex;
        // locate the picese at correct position
        this.x=SIZE.x + SIZE.width*this.colIndex/SIZE.columns;
        this.y=SIZE.y + SIZE.height*this.rowIndex/SIZE.rows;
        // width and height of each piece
        this.width = SIZE.width/SIZE.columns;
        this.height= SIZE.height/SIZE.rows;
        // Actual loction of pieces
        this.xCorrect= this.x;
        this.yCorrect= this.y;

        this.correct=true;
    }
    // Now we have draw pieces dimention of the picd
    draw(context){
        context.beginPath();

        // we made pieces which is the just empty line on the viedo so we need draw using
        // which accepty nini arugument
        context.drawImage(VIDEO,
            this.colIndex*VIDEO.videoWidth/SIZE.columns,
            this.rowIndex*VIDEO.videoHeight/SIZE.rows,
            VIDEO.videoWidth/SIZE.columns,
            VIDEO.videoHeight/SIZE.rows,
            this.x,
            this.y,
            this.width,
            this.height);
            // It will show no effect but each piece show its own clip of video so it now to grag the 
            // element the where we want


        context.react(this.x, this.y,this.width,this.height);
        // Now we have to call stroke method for it
        // draw the outline of any thing
        context.stroke();
    }
    // find out is piece is closed to it or not
    isClose(){
        if(dispatchEvent({x:this.x, y:this.y},{x:this.xCorrect,y:this.yCorrect})<this.width/3){
            return true;
        }
        return false;
    }
    snap(){
        this.x = this.xCorrect;
        this.y = this.yCorrect;
        this.correct=true;
    }
}



function distance(p1, p2){
    return Math.sqrt(
        (p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y)
    );
}