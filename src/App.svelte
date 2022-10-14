<script>
  import videoList from "./videolist.json";
  import Menu from "./components/menu.svelte";
  import { fade, fly } from "svelte/transition";
  import SceneVideo from "./scenes/sceneVideo.svelte";
  import ScenePoster from "./scenes/scenePoster.svelte";

  import Fullscreen from "svelte-fullscreen";
  import MdFullscreen from "svelte-icons/md/MdFullscreen.svelte";
  import MdFullscreenExit from "svelte-icons/md/MdFullscreenExit.svelte";
  import { each } from "svelte/internal";
  let sceneVideo;
  let fstoggle = false;
  let showOnMove = false;
  let timer;
  let currentScene = 0;
  let currentTime = 0;
  let currentCursor = "";
  let ended;

  console.log(videoList);

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

  //   setInterval(() => {
  //     // sceneVideo = document.getElementById('para');
  //     console.log("showOnMove", showOnMove);
  //     // console.log("currentScene", currentScene);
  //     // if (sceneVideo.ended) {
  //     //   showOnMove = true;
  //     // }

  //     // if (currentScene == 2 && sceneVideo.currentTime > 4)
  //     //   currentCursor = "black";
  //     // else currentCursor = "";
  //   }, 500);

  //   {#if currentScene == 0}
  //           <div>
  //             <Scene1 bind:videoElement={sceneVideo} bind:currentScene />
  //           </div>
  //         {:else if currentScene == 1}
  //           <div out:fly={{ x: 200, duration: 2000 }}>
  //             <!-- poster scene -->
  //             <p>test poster</p>
  //           </div>
  //         {:else if currentScene == 2}
  //           <div out:fly={{ x: 200, duration: 2000 }}>
  //             <Scene2 bind:videoElement={sceneVideo} />
  //           </div>
  //         {:else if currentScene == 3}
  //           <div
  //             in:fly={{ x: -200, duration: 2000 }}
  //             out:fade={{ duration: 3000 }}
  //           >
  //             <Scene3 bind:videoElement={sceneVideo} />
  //           </div>
  //         {:else if currentScene == 4}
  //           <div in:fade={{ duration: 3000 }}>
  //             <Scene4 bind:videoElement={sceneVideo} />
  //           </div>
  //         {:else if currentScene == 5}
  //           <div transition:fade>
  //             <Scene5 bind:videoElement={sceneVideo} />
  //           </div>
  //         {:else if currentScene == 6}
  //           <div transition:fade>
  //             <Scene6 bind:videoElement={sceneVideo} />
  //           </div>
  //         {/if}
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
            ><img class="icon" src="img/back.png" /></a
          >
          <a class="right-button" on:click={sceneForward}
            ><img class="icon" src="img/next.png" /></a
          >
          <Menu />
        </div>
      {/if}

      <div class="video-border">
        {#each videoList as scene, sceneNumber}
          {#if currentScene === sceneNumber}
            {#key sceneNumber}
              <div in:fade out:fade={{ duration: 3000 }}>
                {#if scene.type == "video"}
                  <SceneVideo bind:ended bind:scene bind:currentTime id={sceneNumber} />
                {/if}
                {#if scene.type == "poster"}
                  <ScenePoster
                    bind:videoElement={sceneVideo}
                    bind:scene
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
    left: 1vw;
    top: 48%;
  }

  .right-button {
    z-index: 10;
    position: fixed;
    right: 1vw;
    top: 48%;
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
