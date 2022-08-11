<script>
 import Menu from "./components/menu.svelte";
 import Scene1 from "./scenes/scene1.svelte";
 import Scene2 from "./scenes/scene2.svelte";
 import Scene3 from "./scenes/scene3.svelte";
 import Scene4 from "./scenes/scene4.svelte";
 import Scene5 from "./scenes/scene5.svelte";
 import Scene6 from "./scenes/scene6.svelte";
 import { fade, fly } from 'svelte/transition';
 

let sceneVideo

let currentScene = 0
let currentCursor = ""

const sceneBack = () => {
    if(currentScene > 0) currentScene--
    console.log(currentScene)
}

const sceneForward = () => {
    if(currentScene < 5) currentScene++
    else currentScene = 0
    console.log(currentScene)
}


setInterval(()=>{
    console.log("currentTime",sceneVideo.currentTime)
    console.log("currentScene", currentScene)

    if(currentScene == 2 && sceneVideo.currentTime > 4 ) currentCursor = "black"
    else currentCursor = ""
},500
)


</script>

<main class:cursor_black_stamp={currentCursor === "black"} class:cursor_white_stamp={currentCursor === "white"} >
 <Menu />
 <div class="video-border">
{#if currentScene == 0}
            <Scene1 bind:videoElement="{sceneVideo}" />
    {:else if currentScene == 1}

        <Scene2 bind:videoElement="{sceneVideo}"/>
    {:else if currentScene == 2}
    <div  transition:fade>
        <Scene3 bind:videoElement="{sceneVideo}" />
    </div>
    {:else if currentScene == 3}
    <div transition:fade>
        <Scene4 bind:videoElement="{sceneVideo}" />
    </div>

    {:else if currentScene == 4}
    <div transition:fade>
     <Scene5 bind:videoElement="{sceneVideo}" />
    </div>

    {:else if currentScene == 5}
    <Scene6 bind:videoElement="{sceneVideo}" />
    {/if}
</div>
<button class="left-button" on:click={sceneBack}>Back</button>
<button class="right-button" on:click={sceneForward}>next</button>


</main>

<style>
 
 .video-border {
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;
    height: 100vh;
 }

 .left-button {
    z-index: 3;
    position: fixed;
    left: 1vw;
    top: 48%;

 }

 .right-button {
    z-index: 3;
    position: fixed;
    right: 1vw;
    top: 48%;
 }

 .cursor_black_stamp {
  cursor: url(./img/stamp_black.png), auto;
}

.cursor_white_stamp {
  cursor: url(./img/stamp_white.png), auto;
}

</style>
