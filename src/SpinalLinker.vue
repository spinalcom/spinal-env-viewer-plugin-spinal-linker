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
            <child-inspector class="child-inspector"
                             :name="getInspectedNodeName()"
                             :child-info="getChildrenInfo()"
                             :relationNames="relationNames"
                             :default-relation-name="relationName"

                             @get-children="getChildren"
                             @remove-from-parent="onRemoveFromParent"
                             @delete-node="onRemoveFromGraph"
            />
            <div class="spinal-linker-graph-viewer">
                <node-list
                        @node-selected="onNodeSelected"
                        @hide-bim-object="onHideBimObject"
                        @pull-children="onPullNode"
                        @active-node="onActiveNode"

                        :nodes="nodes"
                        :context-ids="contextsId"
                        :childrenIds="childrenIds"
                        :active-node="activeNode"/>
            </div>
        </div>
        <div v-on:click="addNode">
            <button :click="addNode">
                ajouter
            </button>
        </div>
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
      'nodes',
      'contextsId',
      'relationNames',
      'inspectedNodeId',
      'relationName',
      'relationType',
      'childrenIds',
      'activeNode',
      'linkerChildId'
    ] ),
    methods: {
      getNode: ( id ) => {
        return this.nodes[id];
      },

      getChildrenIds: () => {
        return this.nodes[this.inspectedNodeId].childrenIds;
      },

      onRemoveFromGraph: function ( event ) {

          this.$store.commit( 'REMOVE_FROM_GRAPH', event.get() );
        SpinalGraphService.removeFromGraph( event.get() )

      },
      onRemoveFromParent: function( event ) {
        // this.$store.commit( 'REMOVE_FROM_PARENT', event.get() );
      },

      onHideBimObject: function ( event ) {

      },

      onNodeSelected: function ( event ) {
        this.$store.dispatch( "onNodeSelected", event )

      },

      onPullNode: function ( event ) {
        this.$store.commit( "PULL_CHILDREN", event );
      },

      onActiveNode: function ( event ) {
        this.$store.commit( 'SET_ACTIVE_NODE', event )
      },

      isInContext: function ( childrenId, contextId ) {
        let res = false;

        for (let i = 0; i < childrenId.length && !res; i++) {
          const childId = childrenId[i];
          if (this.nodes.hasOwnProperty( childId )) {
            const node = this.nodes[childId];
            const contextIds = node.contextIds;
            for (let j = 0; j < contextIds.length && !res; j++) {
              if (contextId === contextIds[j])
                res = true;
            }
          }
        }

        return res;
      },

      getInspectedNodeName: function () {
        if (this.nodes.hasOwnProperty( this.inspectedNodeId )) {
          return this.nodes[this.inspectedNodeId].name.get();

        }
        return "";
      },

      getChildrenInfo: function () {
        const node = this.nodes[this.inspectedNodeId];
        if (typeof node !== "undefined") {
          const childrenIds = this.nodes[this.inspectedNodeId].childrenIds;
          const childrenInfo = [];
          for (let i = 0; i < childrenIds.length; i++) {
            if (this.nodes.hasOwnProperty( childrenIds[i] ))
              if (this.nodes[childrenIds[i]].hasOwnProperty( 'id' ))
                childrenInfo.push( SpinalGraphService.getInfo( this.nodes[childrenIds[i]].id ) );
              else
                childrenInfo.push( SpinalGraphService.getInfo( this.nodes[childrenIds[i]].getId().get() ) )
          }

          return childrenInfo;
        }
        return []

      },

      getChildren: function ( relationName ) {
        this.$store.dispatch( 'getChildren', relationName )
      },

      addNode: function () {
        this.$store.commit( 'LINK_NODE' )
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


</style>