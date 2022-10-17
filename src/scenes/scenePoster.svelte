<script>
  export let scene
  export let currentScene
</script>



    <div class="poster" style="background: url('/img/{scene.file}');">
      <!-- <img src="/img/{scene.file}" class="background"> -->
      <img src="/img/{scene.overlayFile}" class="overlay" >
      <img on:click="{()=>{currentScene++}}" class="next" src="img/skipIntro.png">
    </div>


// geen links/rechts knoppen maar een start knop, zoals eerder gedaan.

<style>

.poster {
    background-color: black;
    z-index: 24;
    position: fixed;
    top: 0;
    left: 0;
    min-width: 100vw;
    min-height: 100vh;
}


.background {
  z-index: 11;
  max-height: 100vh;
  max-width: 100vw;
}

.overlay {
  z-index: 12;
    max-height: 100vh;
    max-width: 100vw;
    position: relative;
    margin: 0 auto;
    position: absolute;
    bottom: 0;
    -ms-transform: translateX(-50%);
    transform: translateX(-50%);
    left: 50vw;
}

.next {
    z-index: 12;
    position: absolute;
    top: 80vh;
    left: 46vw;
    width: 8vw;
}

.next:hover {
  top: 79vh;
  width:10vw;
  left: 45vw;
  cursor: pointer;
}
</style>