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

        <div class="spinal-linker-body">
            <div class="spinal-linker-graph-viewer">
                <node-list

                        :active-nodes-id="activeNodesId"
                        :nodes="nodes"

                        :contexts-id="contextsId"
                        :get-children-id="getChildrenId"
                        :getNode="getNode"
                        :refresh="refreshed"

                        :show-hide-bim-object="false"
                        @click="onNodeSelected($event)"/>

            </div>

            <child-inspector
                    :child-info="getInspectedChildren()"
                    :defaultRelationName="relationName"
                    :name="inspectedNodeName"
                    :relationNames="relationNames"
                    @get-children="getChildren"
                    @remove-from-parent="onRemoveFromGraph "
            />


        </div>
        <md-button @click="" class="md-raised spinal-linker-button">Link
        </md-button>
    </div>
</template>

<script>
  import {
    ChildInspector,
    NodeList
  } from "spinal-env-viewer-vue-components-lib";
  import { mapState } from 'vuex';
  import { SpinalGraphService } from "spinal-env-viewer-graph-service";

  export default {
    name: "SpinalLinker",
    components: { NodeList, ChildInspector },
    computed: mapState( [
      'refreshed',
      'nodes',
      'contextsId',
      'activeNodesId',
      'inspectedNode',
      'inspectedNodeName',
      'relationName',
      'relationNames',
      'inspectedChildren'
    ] ),
    props: {},
    methods: {
      getInspectedChildren: function () {
        console.log( this.inspectedChildren );
        return this.inspectedChildren;
      },
      getNode: function ( nodeId ) {
        const node = this.nodes.get( nodeId );
        if (typeof nodeId !== "undefined" && typeof node === "undefined") {
          this.$store.dispatch( 'getNode', nodeId )
        }
        return node;
      },

      getChildrenId: function ( nodeId ) {
        return SpinalGraphService.getChildrenIds( nodeId );
      },

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
        this.$store.commit( 'LINK_NODE', event.get() );
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