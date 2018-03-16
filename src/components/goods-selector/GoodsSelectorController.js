import { Inject } from 'angular-es-utils/decorators';
import rowCellTemplate from './tpls/customer-row-cell.tpl.html';
import skuRowCellTemplate from './tpls/customer-sku-row-cell.tpl.html';
import emptyTpl from './tpls/customer-empty.tpl.html';

import angular from 'angular';

@Inject('$ccTips', '$element', 'modalInstance', 'selectedData', 'shopInfoData', '$ccValidator', '$resource', 'selectedData')

export default class GoodsSelectorCtrl {

	$onInit() {
		// 已选商品列表
		// this.selectedGoods = this._selectedData;

		// 店铺信息 -> 如果是 array, 说明需要显示店铺列表
		//         -> 如果是 object, 说明是单店铺
		//         -> 其它情况, 需要提示用户, 参数格式不正确

		this.isShowShopList = Array.isArray(this._shopInfoData);
		this.isTaobao = this.isShowShopList ? this._shopInfoData[0].plat === 'taobao' : this._shopInfoData.plat === 'taobao';

		// form 区域日期配置
		this.dateRange = {
			start: null,
			end: null,
			disabled: false,
			dateOnly: true
		};

		this.shopList = this.isShowShopList ? this._shopInfoData : [this._shopInfoData];
		// 测试数据
		this.selectedGoods = {
			'shopList': this.shopList,
			'goodsCustomList': [
				{
					'title': '不限',
					'value': '不限'
				},
				{
					'title': '自定义类目1',
					'value': '自定义类目1'
				},
				{
					'title': '自定义类目2',
					'value': '自定义类目2'
				},
				{
					'title': '自定义类目3',
					'value': '自定义类目3'
				},
				{
					'title': '自定义类目4',
					'value': '自定义类目4'
				}
			],
			'goodsLabelList': [
				{
					'title': '商品标签1',
					'value': '商品标签1'
				},
				{
					'title': '商品标签2',
					'value': '商品标签2'
				},
				{
					'title': '商品标签3',
					'value': '商品标签3'
				},
				{
					'title': '商品标签4',
					'value': '商品标签4'
				}
			],
			'cascadeSelectMenu': [
				{
					'title': '标准类目1',
					'value': '标准类目1',
					'children': [
						{
							'title': '商品属性1',
							'value': '商品属性1',
							'children': [
								{
									'title': '属性值1',
									'value': '属性值1'
								},
								{
									'title': '属性值2',
									'value': '属性值2'
								}
							]
						},
						{
							'title': '商品属性2',
							'value': '商品属性2',
							'children': [
								{
									'title': '属性值3',
									'value': '属性值3'
								},
								{
									'title': '属性值4',
									'value': '属性值4'
								}
							]
						}
					]
				},
				{
					'title': '标准类目2',
					'value': '标准类目2',
					'children': [
						{
							'title': '商品属性3',
							'value': '商品属性3',
							'children': [
								{
									'title': '属性值5',
									'value': '属性值5'
								},
								{
									'title': '属性值6',
									'value': '属性值6'
								}
							]
						},
						{
							'title': '商品属性4',
							'value': '商品属性4',
							'children': [
								{
									'title': '属性值7',
									'value': '属性值7'
								},
								{
									'title': '属性值8',
									'value': '属性值8'
								}
							]
						}
					]
				}
			],
			'goodsStatusList': [
				{
					'title': '不限',
					'value': '不限'
				},
				{
					'title': '在架',
					'value': '在架'
				},
				{
					'title': '下架',
					'value': '下架'
				}
			]
		};

		this.initForm();

		this.shopFieldsMap = {
			valueField: 'shopName',
			displayField: 'shopName'
		};
		this.shopFieldsMap = {
			valueField: 'value',
			displayField: 'title'
		};
		this.goodsCustomFieldsMap = {
			valueField: 'value',
			displayField: 'title'
		};
		this.goodsLabelFieldsMap = {
			valueField: 'value',
			displayField: 'title'
		};
		this.standardClassifyFieldsMap = {
			valueField: 'value',
			displayField: 'title'
		};
		this.goodsAttrFieldsMap = {
			valueField: 'value',
			displayField: 'title'
		};
		this.goodsAttrValueFieldsMap = {
			valueField: 'value',
			displayField: 'title'
		};
		this.goodsStatusFieldsMap = {
			valueField: 'value',
			displayField: 'title'
		};
		// form 区域价格校验
		this.validators = {
			/**
			 * 价格校验
			 * -> 只能输入数字或两位小数
			 * -> 前一个数字小于或者等于后一个数字
			 * -> 价格区间必须都写, 校验才生效
			 * */
			price: {
				msg: '价格只能填写正数或两位小数.',
				fn: (modelValue, viewValue) => {
					const value = modelValue || viewValue;
					return value ? (/^[0-9]+([.][0-9]{0,2}){0,1}$/).test(value) : !value;
				}
			},
			lowPrice: {
				msg: '价格前项值必须小于后项值',
				fn: (modelValue, viewValue) => {
					const value = modelValue || viewValue;
					const l = parseFloat(value);
					const h = parseFloat(this.formModel.goodsHighPrice);
					if (!isNaN(l) && !isNaN(h)) {
						return l < h;
					}
					return true;
				}
			},
			highPrice: {
				msg: '价格后项值必须大于前项值',
				fn: (modelValue, viewValue) => {
					const value = modelValue || viewValue;
					const l = parseFloat(this.formModel.goodsLowPrice);
					const h = parseFloat(value);
					if (!isNaN(l) && !isNaN(h)) {
						return l < h;
					}
					return true;
				}
			},
			// 数字校验
			number: {
				msg: '请输入整数',
				fn: (modelValue, viewValue) => {
					const value = modelValue || viewValue;
					return value ? (/(^\s*$)|(^\d+$)/).test(value) : !value;
				}
			}
		};

		// 筛选
		this.search = () => {
			this._$ccValidator.validate(this.goodsSelectorForm).then(() => {
				console.log('校验成功!');
			}, () => {
				console.log('校验失败!');
			});
			this.formModel.dateFrom = this.dateRange.start.toLocaleDateString();
			this.formModel.dateTo = this.dateRange.end.toLocaleDateString();
			console.log(this.formModel);
		};
		// 重置表单，恢复初始值
		this.reset = formCtrl => {
			this._$ccValidator.setPristine(formCtrl);
			this.initForm();
		};

		// 点击已选商品tab：表单中商铺列表项显示当前商铺，不可更改，其他恢复默认值
		this.isShopListDisabled = false;
		this.oldFormModel = {};
		this.selectedGoodsClick = () => {
			this.oldFormModel = this.deepCopy(this.formModel);
			this.initForm();
			this.formModel.shopName = this.oldFormModel.shopName;
			this.isShopListDisabled = true;
		};
		// 点击全部商品tab：表单显示上一次的选项，商铺列表项可更改
		this.allGoodsClick = () => {
			Object.assign(this.formModel, this.oldFormModel);
			this.isShopListDisabled = false;
		};


		// 全部商品->表格配置
		this.selectedItems = this._selectedData;
		this.selectedItemsBuf = this.selectedItems.concat();
		this.pagerGridOptions = {
			resource: this._$resource('/api/gridData/1'),
			response: null,
			queryParams: {
				pageNum: 1
			},
			columnsDef: [
				{
					field: 'id',
					displayName: '商品ID',
					align: 'left'
				},
				{
					field: 'quantity',
					displayName: '库存',
					align: 'left',
					sortProp: 'storeCount'
				},
				{
					field: 'price',
					displayName: '价格',
					align: 'left'
				},
				{
					field: 'outerId',
					displayName: '商家编码',
					align: 'left'
				}
			],
			headerTpl: '/src/components/goods-selector/tpls/customer-header.tpl.html',
			rowTpl: '/src/components/goods-selector/tpls/customer-row.tpl.html',
			footerTpl: '/src/components/goods-selector/tpls/customer-footer.tpl.html',
			emptyTipTpl: emptyTpl,
			transformer: res => {
				this.resInfo = res;
				this.currentPageChecked = false;
				return res;
			}
		};
		this.pagerGridOptions.isCheckedGoodsTab = false;
		this.pagerGridOptions.rowCellTemplate = rowCellTemplate;
		this.pagerGridOptions.skuRowCellTemplate = skuRowCellTemplate;
		this.pagerGridOptions.selectedData = this.selectedItems;
		// 表格子行的展开和收起
		this.pagerGridOptions.handleTreeIcon = entity => {
			entity.extend = !entity.extend;
		};
		// 展开/折叠全部
		this.extendAll = (isExtend, data) => {
			data.forEach(item => {
				item.extend = isExtend;
			});
		};
		// 选择父亲则孩子全选
		this.pagerGridOptions.checkTreeRootItem = entity => {
			entity.checked = !entity.checked;
			entity.partial = false;
			entity.skus.forEach(item => {
				item.checked = entity.checked;
			});
			if (!entity.checked) {
				this.currentPageChecked = false;
			}
			// 将已选商品push但selectedItem中
			//    -> 如果父亲被选并且不存在于selectedItem数组中，则将父亲这个整体放到数组中；
			//    -> 如果父亲未选并且存在于selectedItem数组中，则将父亲这个整体删除
			let entityIndex = this.findEntity(this.selectedItems, entity);
			if (entity.checked && entityIndex === -1) {
				this.selectedItems.push(entity);
			}
			if (!entity.checked && entityIndex !== -1) {
				this.selectedItems.splice(entityIndex, 1);
			}
			this.selectedItemsBuf = this.selectedItems.concat();
		};
		// 选择部分孩子父亲半选，选择全部孩子父亲选
		this.pagerGridOptions.checkTreeLeafItem = (entity, sku) => {
			sku.checked = !sku.checked;
			entity.checked = this.isAllChildrenChecked(entity.skus);
			entity.partial = this.isSomeChildrenChecked(entity.skus);
			if (!sku.checked) {
				this.currentPageChecked = false;
			}
			// 将已选商品push到selectedItem中
			//    -> 如果父亲被选，则将父亲push到selectedItem数组中；
			//    -> 如果父亲半选，当父亲存在于selectedItem数组中，则用父亲替换已存在entity；
			//    -> 如果父亲未选，则将父亲从selectedItem数组中删除
			if (entity.checked) {
				if (this.findEntity(this.selectedItems, entity) === -1) {
					this.selectedItems.push(entity);
				}
			} else if (entity.partial) {
				let entityIndex = this.findEntity(this.selectedItems, entity);
				if (entityIndex !== -1) {
					this.selectedItems[entityIndex] = entity;
				} else {
					this.selectedItems.push(entity);
				}
			} else {
				let entityIndex = this.findEntity(this.selectedItems, entity);
				entityIndex !== -1 && this.selectedItems.splice(entityIndex, 1);
			}
			this.selectedItemsBuf = this.selectedItems.concat();
		};
		// 全选当页: -> 将列表数据checked状态置为true
		// 			-> 将当页数据push到已选商品数组中（注意先选择再全选的情况特殊处理）
		this.checkCurrentPage = () => {
			this.currentPageChecked = !this.currentPageChecked;
			this.resInfo.list.forEach(item => {
				item.checked = this.currentPageChecked;
				item.partial = false;
				item.skus && item.skus.forEach(sku => {
					sku.checked = this.currentPageChecked;
				});
			});
			if (this.currentPageChecked) {
				this.selectedItems.splice(0, this.selectedItems.length);
				this.selectedItems.push(...this.resInfo.list);
				this.selectedItemsBuf.forEach(item => {
					if (this.findEntity(this.selectedItems, item) === -1) {
						this.selectedItems.push(item);
					}
				});
			} else {
				let startIndex = this.findEntity(this.selectedItems, this.resInfo.list[0]);
				this.selectedItems.splice(startIndex, this.resInfo.list.length);
			}
			this.selectedItemsBuf = this.selectedItems.concat();
		};
		// 页数改变
		this.onPagerChange = (currentPageNum, pageSize) => {
			console.log(currentPageNum, pageSize);
			let previousPageNum = this.pagerGridOptions.pager.pageNum;
			console.log(previousPageNum);
			console.log(this.selectedItemsBuf);
			this.dataMerge(this.resInfo, this.selectedItemsBuf);
		};


		// 已选商品->表格配置
		this.selectedPagerGridOptions = {};
		for (let key in this.pagerGridOptions) {
			if (this.pagerGridOptions.hasOwnProperty(key)) {
				this.selectedPagerGridOptions[key] = this.pagerGridOptions[key];
			}
		}
		this.selectedPagerGridOptions.resource = null;
		this.selectedPagerGridOptions.externalData = this.selectedItems;
		this.selectedPagerGridOptions.transformer = null;
		// 移除父亲 -> 用作显示的UI数据处理handleRootByDeletingItem：如果已选商品中有父亲，则删除父亲。
		//         -> 用作merge的数据处理handleRootByChangingStatus：如果已选商品中有父亲，则将父亲checked置为false。
		this.selectedPagerGridOptions.removeTreeRootItem = entity => {
			this.handleRootByDeletingItem(entity);
			this.handleRootByChangingStatus(entity);
		};
		// 移除孩子: -> 如果已选商品中有孩子，则将孩子的checked置为false;
		//          -> 如果该孩子的所有兄弟checked都为false，则删除父亲（用作显示的UI数据处理handleChildrenByDeletingChild）
		// 			   或者将父亲checked置为false（用作merge的数据处理handleChildrenByChangingStatus）。
		//          -> 如果该孩子的并不是所有兄弟checked都为false，则将父亲状态置为半选。
		this.selectedPagerGridOptions.removeTreeLeafItem = (entity, sku) => {
			this.handleChildrenByDeletingChild(entity, sku);
			this.handleChildrenByChangingStatus(entity, sku);
		};
		// 移除全部
		this.removeAll = () => {
			this.selectedItems.splice(0, this.selectedItems.length);
			this.selectedItemsBuf.forEach(entity => {
				this.removeParentItem(entity);
			});
		};
	}
	// form 表单初始化
	initForm() {
		this.formModel = {
			shopName: this.selectedGoods.shopList[0].title,
			shopId: null,
			shopNumber: null,
			goodsCustom: [this.selectedGoods.goodsCustomList[0].title],
			goodsLabel: [],
			standardClassify: null,
			goodsAttr: null,
			goodsAttrValue: [],
			goodsStatus: this.selectedGoods.goodsStatusList[0].title,
			goodsCode: null,
			shopCode: null,
			SKUShopCode: null,
			SKUStandard: null,
			dateFrom: null,
			dateTo: null,
			goodsLowPrice: null,
			goodsHighPrice: null
		};
	}
	// 深拷贝,返回新对象
	deepCopy(p, c = {}) {
		for (var i in p) {
			if (typeof p[i] === 'object') {
				c[i] = (p[i].constructor === Array) ? [] : {};
				this.deepCopy(p[i], c[i]);
			} else {
				c[i] = p[i];
			}
		}
		return c;
	}
	// 从集合中获取entity的index,找不到返回-1
	findEntity(collection, entity) {
		return collection.findIndex(item => angular.equals(item, entity));
	}

	isAllChildrenChecked(children) {
		return children && children.every(child => {
			return child.checked;
		});
	}
	isSomeChildrenChecked(children) {
		return children && !this.isAllChildrenChecked(children) && children.some(child => {
			return child.checked || child.partial;
		});
	}
	isAllChildrenNotChecked(children) {
		return !(this.isAllChildrenChecked(children) || this.isSomeChildrenChecked(children));
	}

	handleRootByDeletingItem(entity) {
		let targetIndex = this.findEntity(this.selectedItems, entity);
		if (targetIndex !== -1) {
			this.selectedItems.splice(targetIndex, 1);
		}
	};
	handleRootByChangingStatus(entity) {
		let bufTargetIndex = this.findEntity(this.selectedItemsBuf, entity);
		if (bufTargetIndex !== -1) {
			this.removeParentItem(this.selectedItemsBuf[bufTargetIndex]);
		}
	};

	handleChildrenByDeletingChild(entity, sku) {
		let entityIndex = this.findEntity(this.selectedItems, entity);
		let skuIndex = this.findEntity(this.selectedItems[entityIndex].skus, sku);
		if (skuIndex !== -1) {
			this.selectedItems[entityIndex].skus[skuIndex].checked = false;
			if (this.isAllChildrenNotChecked(entity.skus)) {
				this.selectedItems.splice(entityIndex, 1);
			} else {
				this.selectedItems[entityIndex].partial = true;
				this.selectedItems[entityIndex].checked = false;
			}
		}
	};
	handleChildrenByChangingStatus(entity, sku) {
		let bufEntityIndex = this.findEntity(this.selectedItemsBuf, entity);
		let bufSkuIndex = this.findEntity(this.selectedItemsBuf[bufEntityIndex].skus, sku);
		if (bufSkuIndex !== -1) {
			this.selectedItemsBuf[bufEntityIndex].skus[bufSkuIndex].checked = false;
			if (this.isAllChildrenNotChecked(entity.skus)) {
				this.removeParentItem(this.selectedItemsBuf[bufEntityIndex]);
			} else {
				this.selectedItemsBuf[bufEntityIndex].partial = true;
				this.selectedItemsBuf[bufEntityIndex].checked = false;
			}
		}
	};

	// 移除一个父亲节点
	removeParentItem(entity) {
		entity.checked = false;
		entity.partial = false;
		entity.skus.forEach(sku => {
			sku.checked = false;
		});
	}

	// 点击tab
	tabClick(text) {
		if (text === '全部商品') {
			this.dataMerge(this.resInfo, this.selectedItemsBuf);
		}
	}
	// merge->点击已选商品之后再点击全部商品，全部商品的当前页能够保持商品被选状态
	// 		->点击下一页之后再点击上一页，保持商品被选状态
	dataMerge(selectedGoodsArr, goodsArr) {
		for (let i = 0; i < goodsArr.length; i++) {
			for (let j = i; j < selectedGoodsArr.length; j++) {
				if (goodsArr[i].id === selectedGoodsArr[j].id) {
					goodsArr[i] = selectedGoodsArr[j];
					break;
				}
			}
		}
	}
}
