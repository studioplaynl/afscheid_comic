<script>
  import MdMenu from "svelte-icons/md/MdMenu.svelte";
  import MdClose from "svelte-icons/md/MdClose.svelte";

  export let showOnMove;

  let menuOpen = false;

  let MenuToggle = () => {
    menuOpen = !menuOpen;
    showOnMove = true;
  };
</script>

<div class="menu-icon" on:click={MenuToggle}>
  {#if menuOpen}
    <MdClose />
  {:else if showOnMove}
    <img src="img/menuShoe.png" />
  {/if}
</div>

{#if menuOpen}
  <div class="about">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed at justo
      sagittis libero condimentum aliquet. Etiam rhoncus libero id ipsum
      placerat efficitur. Suspendisse at sapien a lorem gravida imperdiet a in
      sem. Pellentesque pharetra nulla nec lectus feugiat, nec posuere dui
      sagittis. In ut lorem in libero dapibus faucibus. Cras et suscipit dolor,
      a cursus urna. Donec in commodo ante.
    </p>
    <p />
    <p>
      Vivamus nec euismod leo, et venenatis urna. Vivamus rhoncus porttitor
      dapibus. Duis dui urna, tristique efficitur ligula non, faucibus
      sollicitudin dui. Pellentesque ut felis eget metus euismod iaculis.
      Suspendisse lobortis ligula ac ipsum faucibus, ultricies tempor magna
      egestas. Phasellus finibus faucibus diam, aliquam mollis nunc facilisis
      ac. Aliquam erat volutpat. Nam facilisis nulla ut mi pharetra fermentum.
      Mauris convallis eu quam sit amet ornare.
    </p>
    <p />
    <p>
      Nam pharetra sem suscipit lacinia iaculis. Pellentesque habitant morbi
      tristique senectus et netus et malesuada fames ac turpis egestas. Quisque
      libero dolor, volutpat ullamcorper ante non, accumsan fringilla dolor.
      Nunc et vehicula massa, id sagittis nibh. Praesent finibus mattis sapien a
      blandit. Pellentesque eu ultricies sapien, quis porta nisl. Sed commodo
      velit diam, sit amet tristique libero suscipit ut. Morbi sit amet ex a
      mauris dignissim fringilla ac quis enim. Proin metus libero, egestas ac
      sodales vitae, iaculis in enim. Maecenas id posuere orci. Maecenas vel
      eleifend eros.
    </p>
    <p />
    <p>
      Fusce a augue vel nulla eleifend eleifend non ut odio. Donec cursus
      pretium efficitur. Phasellus tristique, nibh a molestie viverra, metus
      orci venenatis erat, at cursus nulla lectus quis sem. Ut commodo finibus
      laoreet. Aenean condimentum erat id mattis hendrerit. Phasellus sit amet
      nisi bibendum, viverra turpis nec, gravida mauris. In non auctor risus.
      Vestibulum id velit facilisis, commodo urna et, varius dui. Pellentesque
      dictum nulla justo, vitae efficitur ex rhoncus porttitor. Integer nec
      lobortis quam, et accumsan nunc. Duis imperdiet maximus lobortis. Duis nec
      justo nisl. In tincidunt risus nec turpis vehicula, eget dapibus massa
      consectetur. Sed faucibus sit amet nisi eget vestibulum.
    </p>
    <p />
    <p>
      Aenean rhoncus vestibulum odio, sed convallis felis cursus sit amet. Morbi
      euismod nibh ac dui semper venenatis. Praesent malesuada pulvinar
      pulvinar. Ut condimentum vestibulum metus eu gravida. Nullam purus dolor,
      tincidunt vel nunc eget, rhoncus blandit turpis. Proin at mauris in dui
      congue viverra sed vel odio. Ut sed lectus magna. Etiam rhoncus sodales
      imperdiet. Mauris mauris erat, finibus a ipsum vel, condimentum interdum
      ex.
    </p>
  </div>
{/if}

<style>
  .menu-icon {
    color: black;
    width: 75px;
    height: 32px;
    margin: 15px;
    position: absolute;
    right: 0px;
    z-index: 10;
    cursor: pointer;
  }

  .menu-icon > img {
    width: 64px;
  }

  .menu-icon > img:hover {
    width: 75px;
  }

  li {
    list-style: none;
  }
  a {
    cursor: pointer;
    color: black;
  }

  .menu {
    background-color: white;
    padding: 15px;
  }

  .about {
    background-color: white;
    z-index: 9;
    position: fixed;
    margin: 5vw;
    padding: 5vw;
    min-height: 100vw;
  }
</style>
