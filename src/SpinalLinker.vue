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
        <h1>{{name}}</h1>
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
  import { SpinalGraphService } from "spinal-env-viewer-graph-service";
  import NodeItem from "./node-item.vue";


  export default {
    name: "SpinalLinker",
    components: { NodeItem, },
    data: function () {
      return {
        'contextsId': [],
        'inspectedNode': '',
        'relationName': '',
        'relationType': '',
      };
    },
    computed: {
      name: function () {
        if (this.inspectedNode && this.inspectedNode.hasOwnProperty( 'name' ))
          return this.inspectedNode.name.get();
        return ''
      }
    },
    methods: {
      opened: function ( option ) {

        this.relationName = option.relationName;
        this.relationType = option.relationType;
        this.inspectedNode = option.selectedNode;
        this.contextsId = [];
        const graphId = SpinalGraphService.getGraph().info.id.get();
        SpinalGraphService.getChildren( graphId, [] ).then( children => {
          for (let i = 0; i < children.length; i++) {
            if (children[i].hasOwnProperty( 'id' ))
              this.contextsId.push( children[i].id.get() )
          }
        } );
      },
      closed: function () {

      },
      removed: function () {
      }
    }
  }
</script>

<style>

    .plugin-spinal-linker * {
        box-sizing: border-box;
    }

</style>