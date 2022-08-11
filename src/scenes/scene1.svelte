<script>
  export let videoElement

</script>


<video class="Scene01" bind:this="{videoElement}" autoplay controls>
    <source src="/video/Scene01.m4v" type="video/mp4">
  Your browser does not support the video tag.
  </video> 



<style>

video {
  z-index: 1;
}
</style>