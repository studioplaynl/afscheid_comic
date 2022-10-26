<script>
  // import videoList from "./videolist.json";
  import videoList from "./videolist.json"
  import Menu from "./components/menu.svelte";
  import { fade } from "svelte/transition";
  import SceneVideo from "./scenes/sceneVideo.svelte";
  import ScenePoster from "./scenes/scenePoster.svelte";
  import {onMount} from 'svelte';
  import Fullscreen from "svelte-fullscreen";
  import MdFullscreen from "svelte-icons/md/MdFullscreen.svelte";
  import MdFullscreenExit from "svelte-icons/md/MdFullscreenExit.svelte";
 import { cubicInOut,  linear, cubicIn, quadInOut, quadIn, quadOut} from 'svelte/easing';

  let sceneVideo;
  let fstoggle = false;
  let showOnMove = false;
  let timer;
  let currentScene = 0;
  let currentTime = 0;
  let currentCursor = "";
  let ended;
  let paused;

  // console.log(videoList);

//  {"type": "poster", "file": "poster.png", "transition": {"type": "fade", "x": "", "delay": "100", "duration": "4000"}, "transitionIn": {"type": "fade", "x": "", "duration": "10000"}, "transitionOut": {"type": "fade", "x": "", "duration": "10000"} },


  onMount(()=>{
      paused = false
  })

  const sceneBack = () => {
    if (currentScene > 0) currentScene--;
    console.log(currentScene);
  };

  const sceneForward = () => {
    if (currentScene < videoList.length) currentScene++;
    else currentScene = 0;
    console.log(currentScene);
  };

  const onMouseMove = () => {
    showOnMove = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      showOnMove = false;
    }, 2000);
  };
  $: showOnMove = ended || false;

  
  $: if (currentScene == 2 && currentTime > 4) {
    currentCursor = "black";
  } else {
    currentCursor = "";
  }

function transitionIn(node, scene) {
  console.log("scene IN", scene)
if(scene === undefined) return;

const style = getComputedStyle(node);
//console.log("style", style)
const opacity = +style.opacity;
const transform = style.transform === 'none' ? '' : style.transform;


const width = parseFloat(style.width);
//console.log("width", width)
//console.log("transform", transform)

let delay = scene.transition.delay || 0;
let duration = scene.transition.duration * 1.2|| 2000;
console.log("transition IN", scene.transition.type, duration)
let x = ~scene.transition.x || 0
let y = ~scene.transition.y || 0

if(scene.transition.type === 'fade') {
    return {
    delay,
    duration,
    css: t => `transform: ${transform} translate(${ -50}${'%'}, ${0}${'%'});opacity: ${t * opacity}`
};
}

if(scene.transition.type === 'slide') {
    console.log('slide')

    let xValue = 100;
    let xUnit = '%'
    

    let yValue = 0;
    let yUnit = '%'
    
 console.log("yValue, xValue",yValue, xValue)

    return {
        delay,
        duration,
        
        css: (t) => {
          const eased = linear(t);
          return `transform: ${transform} translate(${ -50}${'%'}, ${0}${'%'});transform: ${transform} translate(${ (1 - eased) * xValue}${xUnit}, ${(1 - eased) * yValue}${yUnit});`
        }
    };
  
}
//        transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});`
         //             translateX(${u * 100}%);`
   

}

  function transitionOut(node) {
    let scene = videoList[currentScene-1]
    if(scene === undefined) return;
    
    console.log("scene OUT", scene)
    scene = videoList[currentScene]
    
    const style = getComputedStyle(node);
	  const opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;

    let delay = scene.transition.delay || 0;
	  let duration = scene.transition.duration || 400;

    console.log("transition OUT", scene.transition.type, duration)

    let x = scene.transition.x || 0
    let y = scene.transition.y || 0
    if(scene.transition.type === 'fade') {
        return {
		delay,
		duration,
		css: t => `transform: ${transform} translate(${ 50}${'%'}, ${0}${'%'});opacity: ${t * opacity}`
	};
    }
    if(scene.transition.type === 'slide') {
        
        console.log('element', videoList[currentScene-1].file)
	
		let xValue = 50;
		let xUnit = '%'

	
		let yValue = 0;
		let yUnit = '%'
		
	
		    return {
        delay,
        duration,
        
        css: t => {
          const eased = linear(t);
          return `transform: ${transform} translate(${ -50}${'%'}, ${0}${'%'});transform: ${transform} translate(${ eased * xValue}${xUnit}, ${eased * yValue}${yUnit});`
        }
    };
    }
	
}


</script>

<main
  on:mousemove={onMouseMove}
  on:click={onMouseMove}
  
>
<div class="cursor_black_stamp"
class:cursor_black_stamp={currentCursor === "black"}
class:cursor_white_stamp={currentCursor === "white"}
>
  <Fullscreen let:onRequest let:onExit>
    <div>
      {#if showOnMove}
        <div transition:fade>
          {#if !fstoggle}
            <div
              class="fullscreen-toggle"
              on:click={() => {
                onRequest();
                fstoggle = true;
                screen.orientation.lock("landscape");
              }}
            >
              <MdFullscreen />
            </div>
          {:else}
            <div
              class="fullscreen-toggle"
              on:click={() => {
                onExit();
                fstoggle = false;
              }}
            >
              <MdFullscreenExit />
            </div>
          {/if}
          <a class="left-button" on:click={sceneBack}
            ><img class="icon" src="img/back2.png" /></a
          >
          <a class="right-button" on:click={sceneForward}
            ><img class="icon" src="img/next2.png" /></a
          >
        </div>
        {/if}
        <Menu bind:showOnMove />

      <div class="video-border">
        {#each videoList as scene, sceneNumber}
          {#if currentScene === sceneNumber}
            {#key sceneNumber}
              <div in:transitionIn="{videoList[currentScene]}" out:transitionOut="{videoList[currentScene-1]}">
                {#if scene.type == "video"}
                  <SceneVideo bind:ended bind:scene bind:currentTime bind:paused id={sceneNumber} />
                {/if}
                {#if scene.type == "poster"}
                  <ScenePoster
                    bind:videoElement={sceneVideo}
                    bind:scene
                    bind:currentScene
                    id={sceneNumber}
                  />
                {/if}
              </div>
            {/key}
          {/if}
        {/each}
      </div>
    </div>
  </Fullscreen>
</div>
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
    z-index: 10;
    position: fixed;
    left: 3vw;
    bottom: 8vh;
  }

  .right-button {
    z-index: 10;
    position: fixed;
    right: 3vw;
    bottom: 8vh;
  }

  .cursor_black_stamp {
    cursor: url(/img/stamp_black.png), auto;
  }

  .cursor_white_stamp {
    cursor: url(/img/stamp_white.png), auto;
  }

  .fullscreen-toggle {
    width: 40px;
    height: 40px;
    z-index: 10;
    position: fixed;
    margin: 10px;
    color: white;
  }

  .icon {
    width: 64px;
  }

  .icon:hover {
    width: 75px;
    cursor: pointer;
  }
</style>
