<!--
  - Copyright 2019 SpinalCom - www.spinalcom.com
  -
  -  This file is part of SpinalCore.
  -
  -  Please read all of the following terms and conditions
  -  of the Free Software license Agreement ("Agreement")
  -  carefully.
  -
  -  This Agreement is a legally binding contract between
  -  the Licensee (as defined below) and SpinalCom that
  -  sets forth the terms and conditions that govern your
  -  use of the Program. By installing and/or using the
  -  Program, you agree to abide by all the terms and
  -  conditions stated or referenced herein.
  -
  -  If you do not agree to abide by these terms and
  -  conditions, do not demonstrate your acceptance and do
  -  not install or use the Program.
  -  You should have received a copy of the license along
  -  with this file. If not, see
  -  <http://resources.spinalcom.com/licenses.pdf>.
  -->

<template>
    <div class="plugin-spinal-linker">
        <h1>{{inspectedNode.name.get()}}</h1>
        <node-item v-for="(contextId) in contextsId"
                   :node-id="contextId"
                   :invert-link="false"
                   :link-id="inspectedNode.id.get()"
                   :link-relation-name="relationName"
                   :link-relation-type="relationType"
        />
    </div>
</template>

<script>

  import {
    mapState,
    mapGetters
  } from 'vuex';
  import { SpinalGraphService } from "spinal-env-viewer-graph-service";
  import NodeItem from "./node-item.vue";

  function test() {
    const res = {};
    for (const arg of arguments) {
      Object.assign( res, arg );
    }
    return res;
  }

  export default {
    name: "SpinalLinker",
    components: { NodeItem, },
    computed: test(
      mapState( [
        'contextsId',
        'inspectedNode',
        'relationName',
        'relationType'
      ] ),
    ),
    methods: {

      onNodeSelected: function ( event ) {
        this.$store.dispatch( "onNodeSelected", event )
          .then()
          .catch( e => console.error( e ) );
      },

      getChildren: function ( relationName ) {
        this.$store.dispatch( 'getChildren', relationName )
      },

      onRemoveFromGraph: function ( event ) {
        this.$store.commit( 'REMOVE_FROM_GRAPH', event.get() );
        SpinalGraphService.removeFromGraph( event.get() )
      },

      addNode: function ( event ) {
        this.$store.commit( 'LINK_NODE', this.activeNodesId[0] );
      }

    }
  }
</script>

<style>

    .plugin-spinal-linker * {
        box-sizing: border-box;
    }

    .spinal-linker-body {
        display: flex;
    }

    .spinal-linker-graph-viewer {
        border-left: 1px solid rgba(128, 128, 128, 0.64);
        width: 50%;
        overflow-y: auto;
        overflow-x: hidden;

    }

    .child-inspector {
        width: 50%;
    }

    .spinal-linker-button {
        right: 0;
        bottom: 0;
        position: absolute;

    }
</style>