<script>
  export let scene;
  export let currentScene;
</script>

<div class="poster">
  <img src="/img/{scene.overlayFile}" class="overlay" />
  <img
    on:click={() => {
      currentScene++;
    }}
    class="enterButton"
    src="img/skipIntro2.png"
  />
</div>


<style>
  .poster {
    background-color: black;
    z-index: 11;
    position: absolute;
    top: 0;
    left: 0;
    min-width: 100%; 
    min-height: 100%; 
    background-image: url("/img/poster_bg.png");
    height: 100%;

    /* Center and scale the image nicely */
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .overlay {
    z-index: 12;
    max-height: 100vh;
    max-width: 100vw;

    /* position: relative; */
    margin: 0 auto;
    position: absolute;
    bottom: 0;
    -ms-transform: translateX(-50%);
    transform: translateX(-50%);
    left: 50vw;
  }



  .enterButton {
    cursor: pointer;
    z-index: 12;
    position: absolute;
    top: 75vh;
    left: 50vw;
    width: 70pt;
    transform: translateX(-25%) translateY(-25%);

    -webkit-animation: bounce 4s infinite ease-in-out;
    -o-animation: bounce 4s infinite ease-in-out;
    -ms-animation: bounce 4s infinite ease-in-out; 
    -moz-animation: bounce 4s infinite ease-in-out; 
    animation: bounce 4s infinite ease-in-out;
  }
@-webkit-keyframes bounce {
    0% { transform: translateY(-25px)  }
    50% { transform: translateY(25px) }
    100% { transform: translateY(-25px) }
}

@keyframes bounce {
    0% { transform: translateY(-25px)  }
    50% { transform: translateY(25px) }
    100% { transform: translateY(-25px) }
}

  .enterButton:hover {
    width: 80pt;
  }
</style>
