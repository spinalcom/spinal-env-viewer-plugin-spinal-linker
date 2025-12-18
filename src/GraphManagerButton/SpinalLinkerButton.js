/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import {
  SpinalContextApp,
  spinalContextMenuService,
} from 'spinal-env-viewer-context-menu-service';
import {
  spinalPanelManagerService,
} from 'spinal-env-viewer-panel-manager-service';
import {
  SpinalGraphService,
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-env-viewer-graph-service';

export default class SpinalLinkerButton extends SpinalContextApp {
  constructor() {
    super('SpinalLinker', 'Open SpinalLinker', {
      icon: 'link',
      icon_type: 'in',
      backgroundColor: '#000000',
      fontColor: '#ffffff',
    });
  }

  isShown(option) {
    return Promise.resolve(true);
  }

  action(option) {
    let selectedNode = option.selectedNode;
    let selectedContext = option.context;
    if (option.selectedNode instanceof SpinalNode) {
      SpinalGraphService._addNode(option.selectedNode);
      selectedNode = SpinalGraphService.getInfo(option.selectedNode.getId());
    }
    if (option.selectedContext instanceof SpinalNode) {
      SpinalGraphService._addNode(option.selectedContext);
      selectedContext = SpinalGraphService.getInfo(option.selectedContext.getId());
    }
    const param = {
      relationName: 'hasEndPoint',
      relationType: SPINAL_RELATION_PTR_LST_TYPE,
      selectedNode: selectedNode,
      selectedContext: selectedContext,
    };
    spinalPanelManagerService.openPanel('plugin-spinal-linker', param);
  }
}

const TopBarName = 'GraphManagerSideBar';
const circularMenuName = 'circularMenu';

spinalContextMenuService.registerApp(TopBarName, new SpinalLinkerButton(), [3]);
spinalContextMenuService.registerApp(
  circularMenuName,
  new SpinalLinkerButton(), [3]
);
