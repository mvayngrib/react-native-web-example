'use strict';

var React = require('react-native');
var moment = require('moment')
var ResourceList = require('./ResourceList')
var EnumList = require('./EnumList')
var Picker = require('./Picker')
// var FloatLabel = require('react-native-floating-labels')
var FloatLabelTextInput = require('react-native-floating-label-text-input');
var Icon = require('react-native-vector-icons/Ionicons');
var utils = require('../utils/utils');

var translate = utils.translate

var constants = require('@tradle/constants');
var t = require('tcomb-form-native');
// var Actions = require('../Actions/Actions');
// var Device = require('react-native-device')
var extend = require('extend');
var DEFAULT_CURRENCY_SYMBOL = '£';
var CURRENCY_SYMBOL
var ENUM = 'tradle.Enum'
// var Picker = require('react-native-picker')
// var NewDatePicker = require('./NewDatePicker')

var SETTINGS = 'tradle.Settings'

var cnt = 0;
var propTypesMap = {
  'string': t.Str,
  'boolean': t.Bool,
  'date': t.Dat,
  'number': t.Num
};
var {
  Text,
  View,
  TouchableHighlight,
  // TouchableOpacity,
  StyleSheet,
  Navigator,
  Dimensions
} = React;
var LINK_COLOR, DEFAULT_LINK_COLOR = '#a94442'

var NewResourceMixin = {
  getFormFields(params) {
    CURRENCY_SYMBOL = this.props.currency ? this.props.currency.symbol ||  this.props.currency : DEFAULT_CURRENCY_SYMBOL

    if (this.props.bankStyle)
      LINK_COLOR = this.props.bankStyle.LINK_COLOR || DEFAULT_LINK_COLOR
    else
      LINK_COLOR = DEFAULT_LINK_COLOR

    var meta = this.props.model  ||  this.props.metadata;
    var model = params.model;  // For the form
    var isMessage = meta.interfaces
    var onSubmitEditing = isMessage ? this.onSubmitEditing  ||  params.onSubmitEditing : this.onSavePressed
    var onEndEditing = this.onEndEditing  ||  params.onEndEditing
    var chooser = this.chooser  ||  this.props.chooser
    var models = utils.getModels();
    var data = params.data;
    var options = {};
    options.fields = {};

    var props, bl;
    if (!meta.items)
      props = meta.properties;
    else {
      bl = meta.items.backlink;
      if (!meta.items.ref)
        props = meta.items.properties;
      else
        props = utils.getModel(meta.items.ref).properties;
    }

    var dModel = data  &&  models[data[constants.TYPE]]
    if (!utils.isEmpty(data)) {
      if (!meta.items && data[constants.TYPE] !== meta.id) {
        var interfaces = meta.interfaces;
        if (!interfaces  ||  interfaces.indexOf(data[constants.TYPE]) == -1)
           return;

        data[constants.TYPE] = meta.id;
        for (let p in data) {
          if (p == constants.TYPE)
            continue;
          if (props[p])
            continue;
        }
      }
    }

    var editCols;
    if (this.props.editCols) {
      editCols = {};
      this.props.editCols.forEach(function(r) {
        editCols[r] = props[r];
      })
    }
    else
      editCols = utils.arrayToObject(meta.editCols);

    var eCols = editCols ? editCols : props;
    var required = utils.arrayToObject(meta.required);
    // var d = data ? data[i] : null;
    for (var p in eCols) {
      if (p === constants.TYPE  ||  p === bl  ||  (props[p].items  &&  props[p].items.backlink))
        continue;
      if (meta  &&  meta.hidden  &&  meta.hidden.indexOf(p) !== -1)
        continue
      var maybe = required  &&  !required.hasOwnProperty(p);

      var type = props[p].type;
      var formType = type !== 'boolean'  &&  propTypesMap[type];
      // Don't show readOnly property in edit mode if not set
      if (props[p].readOnly) //  &&  (type === 'date'  ||  !data  ||  !data[p]))
        continue;

      var label = translate(props[p], meta) //props[p].title;
      if (!label)
        label = utils.makeLabel(p);
      options.fields[p] = {
        error: translate('thisFieldIsRequired'), //'This field is required',
        bufferDelay: 20, // to eliminate missed keystrokes
      }
      var isRange
      if (props[p].units) {
        if (props[p].units.charAt(0) === '[') {
          options.fields[p].placeholder = label  + ' ' + props[p].units
          // isRange = type === 'number'  &&  props[p].units == '[min - max]'
          // if (isRange) {
          //   formType = t.Str
          //   var Range = t.refinement(t.Str, function (n) {
          //     var s = s.split(' - ')
          //     if (s.length < 2  ||  s > 3)
          //       return false

          //     if (!s[0].match(/\d{1,2}[\,.]{1}\d{1,2}/)  ||  !s[1].match(/\d{1,2}[\,.]{1}\d{1,2}/))
          //       return false
          //     return true
          //   });
          //   model[p] = maybe ? t.maybe(Range) : Range;

          // }
        }
        else
          options.fields[p].placeholder = label + ' (' + props[p].units + ')'
      }
      // HACK for registration screen
      if (this.state.isRegistration  &&  params.editCols.length === 1)
        options.fields[p].placeholder = translate('enterYourName')

      if (props[p].description)
        options.fields[p].help = props[p].description;
      if (props[p].readOnly  ||  (props[p].immutable  &&  data  &&  data[p]))
        options.fields[p] = {'editable':  false };
      // if (formType  &&   (formType === t.Num  ||  formType === t.Str))
      //   formType = null

      if (formType) {
        if (props[p].keyboard)
          options.fields[p].keyboardType = props[p].keyboard

        // if (this.onChange)
        //   options.fields[p].onChange = this.onChange.bind(this);
        model[p] = !model[p]  &&  (maybe ? t.maybe(formType) : formType);
        if (data  &&  (type == 'date')) {
          model[p] = t.Str
          // options.fields[p].keyboardType = 'numbers-and-punctuation'
          // options.fields[p].template = this.myDateTemplate.bind(this, {
          //           label: label,
          //           prop:  props[p],
          //           model: meta,
          //           value: data[p] ? new Date(data[p]) : data[p]
          //         })
          // if (!this.state.modal || typeof this.state.modal[p] === 'undefined')
          //   this.state.modal[p] = false
          options.fields[p].placeholder = translate(props[p]) + ' (mm/dd/yyyy)'
          // if (data[p])
          //   data[p] = new Date(data[p]);
          // options.fields[p].mode = 'date';
          // options.fields[p].auto = 'labels';
          // options.fields[p].label = label
          // options.fields[p].onDateChange = this.onDateChange
        }
        else if (type === 'string') {
          if (props[p].maxLength > 100)
            options.fields[p].multiline = true;
          options.fields[p].autoCorrect = false;
          if (props[p].oneOf) {
            model[p] = t.enums(props[p].oneOf);
            options.fields[p].auto = 'labels';
          }
        }
        if (!options.fields[p].multiline && (type === 'string'  ||  type === 'number' || type === 'date')) {
          options.fields[p].template = this.myTextInputTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    model: meta,
                    value: data  &&  data[p] ? data[p] + '' : null,
                    required: !maybe,
                    keyboard: props[p].keyboard ||  (type === 'number' ? 'numeric' : 'default'),
                  })
          options.fields[p].enablesReturnKeyAutomatically = true

          options.fields[p].onSubmitEditing = onSubmitEditing.bind(this);
          if (onEndEditing)
            options.fields[p].onEndEditing = onEndEditing.bind(this, p);
          if (props[p].maxLength)
            options.fields[p].maxLength = props[p].maxLength;
          if (type === 'number') {
            if (!props[p].keyboard)
              options.fields[p].keyboardType = 'numeric'
            if (data[p]  &&  (typeof data[p] != 'number'))
              data[p] = parseFloat(data[p])
          }
        }
      }
      else if (props[p].oneOf) {
        model[p] = t.enums(props[p].oneOf);
        options.fields[p].auto = 'labels';
      }
      else if (type == 'enum') {
        var facet = props[p].facet;
        var values = models.filter(mod => {
           return mod.type === facet ? mod.values : null;
        });
        if (values && values.length) {
          var enumValues = {};
          values[0].values.forEach(function(val) {
            enumValues[val.label] = val.displayName;
          });
          // options.fields[p].factory = t.form.radio;
          model[p] = t.enums(enumValues);
        }
        options.fields[p].auto = 'labels';
      }
      else {
        var ref = props[p].ref;
        if (!ref) {
          if (type === 'number'  ||  type === 'string')
            ref = constants.TYPES.MONEY
          else if (type === 'boolean') {
            ref = 'tradle.Boolean'
            model[p] = maybe ? t.maybe(t.Str) : t.Str
          }
          else
            continue;
        }
        if (ref === constants.TYPES.MONEY) {
          model[p] = maybe ? t.maybe(t.Num) : t.Num;
          // if (data[p]  &&  (typeof data[p] != 'number'))
          //   data[p] = data[p].value
          var units = props[p].units
          // options.fields[p].onFocus = chooser.bind(this, props[p], p)
          var value = data[p]
          if (value) {
            if (typeof value !== 'object') {
              value = {
                value: value,
                currency: CURRENCY_SYMBOL
              }
            }
            else if (!value.currency)
              value.currency = CURRENCY_SYMBOL
          }
          else {
            value = {
              currency: CURRENCY_SYMBOL
            }
          }
          options.fields[p].template = this.myMoneyInputTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    value: value,
                    model: meta,
                    keyboard: 'numeric',
                    required: !maybe,
                  })


          // options.fields[p].template = textTemplate.bind(this, {
          //           label: label,
          //           prop:  props[p],
          //           value: data[p] ? data[p] + '' : null,
          //           keyboard: units  &&  units.charAt(0) === '[' ? 'numbers-and-punctuation' : 'numeric',
          //           required: !maybe,
          //         })

          // options.fields[p].template = moneyTemplate.bind({}, props[p])

          options.fields[p].onSubmitEditing = onSubmitEditing.bind(this)
          options.fields[p].onEndEditing = onEndEditing.bind(this, p);
          continue;
        }
        model[p] = maybe ? t.maybe(t.Str) : t.Str;

        var subModel = models[ref];
        if (data  &&  data[p]) {
          options.fields[p].value = data[p][constants.TYPE]
                                  ? data[p][constants.TYPE] + '_' + data[p][constants.ROOT_HASH]
                                  : data[p].id;
          data[p] = utils.getDisplayName(data[p], subModel.properties) || data[p].title;
        }

        options.fields[p].onFocus = chooser.bind(this, props[p], p)
        options.fields[p].template = this.myCustomTemplate.bind(this, {
            label: label,
            prop:  p,
            required: !maybe,
            chooser: options.fields[p].onFocus
          })

        options.fields[p].nullOption = {value: '', label: 'Choose your ' + utils.makeLabel(p)};
      }
    }
    return options;
  },
  getNextKey() {
    return (this.props.model  ||  this.props.metadata).id + '_' + cnt++
  },
  onChangeText(prop, value) {
    var r = {}
    extend(true, r, this.state.resource)
    if(prop.type === 'number')
      value = Number(value)
    if (!this.floatingProps)
      this.floatingProps = {}
    if (prop.ref == constants.TYPES.MONEY) {
      if (!this.floatingProps[prop.name])
        this.floatingProps[prop.name] = {}
      this.floatingProps[prop.name].value = value
      if (!r[prop.name])
        r[prop.name] = {}
      r[prop.name].value = value
    }
    else {
      r[prop.name] = value
      this.floatingProps[prop.name] = value
    }
    this.setState({resource: r})
    // if (this.state.resource[constants.TYPE] !== SETTINGS)
    //   Actions.saveTemporary(r)
  },
  onChangeTextValue(prop, value, event) {
    console.log(arguments)
    if (prop.ref && prop.ref === constants.TYPES.MONEY) {
      if (typeof value === 'string'  ||  typeof value === 'number')
        value = {
          value: value,
          currency: CURRENCY_SYMBOL
        }
    }

    this.state.resource[prop.name] = value
    // this.setState({resource: this.state.resource})
    if (!this.floatingProps)
      this.floatingProps = {}
    this.floatingProps[prop.name] = value;
    // prop.type === 'object' && prop.ref === constants.TYPES.MONEY
    //                                     ? {value: value}
    //                                     : value
    // var r = {}
    // extend(r, this.state.resource)
    // for (var p in this.floatingProps)
    //   r[p] = this.floatingProps[p]
    // Actions.saveTemporary(r)
  },
  myTextInputTemplate(params) {
    // return <View />
    var error, err
    if (params.noError)
      error = <View />
    else {
      err = this.state.missedRequiredOrErrorValue
          ? this.state.missedRequiredOrErrorValue[params.prop.name]
          : null

      error = err
            ? <View style={{paddingLeft: 15, backgroundColor: 'transparent'}} key={this.getNextKey()}>
                <Text style={{fontSize: 14, color: this.state.isRegistration ? '#eeeeee' : '#a94442'}}>{err}</Text>
              </View>
            : <View key={this.getNextKey()} />
    }
    var label = translate(params.prop, params.model)
    if (params.prop.units) {
      let units = translate(params.prop.units)
      label += (params.prop.units.charAt(0) === '[')
             ? ' ' + units
             : ' (' + units + ')'
    }
    label += params.required ? '' : ' (' + translate('optional') + ')'
    // label += (params.prop.ref  &&  params.prop.ref === constants.TYPES.MONEY)
    //        ?  ' (' + CURRENCY_SYMBOL + ')'
    //        : ''
    return (
      <View style={{paddingBottom: 10, flex: 5}}>
        <FloatLabelTextInput
          ref={params.prop.name}
          err={err}
          placeHolder={label}
          onFocus={this.inputFocused.bind(this, params.prop.name)}
          value={params.value}
          style={{fontSize: 30, fontFamily: 'Helvetica Neue, STHeiTi, sans-serif'}}
          keyboardType={params.keyboard || 'default'}
          onChangeTextValue={this.onChangeTextValue.bind(this, params.prop)}
        />
        {error}
      </View>
    );
    // return (
    //   <View style={{paddingBottom: 10, flex: 5}}>
    //     <FloatLabel
    //       labelStyle={styles.labelInput}
    //       autoCorrect={false}
    //       autoCapitalize={this.state.isRegistration &&  params.prop.name !== 'url' ? 'sentences' : 'none'}
    //       onFocus={this.inputFocused.bind(this, params.prop.name)}
    //       inputStyle={this.state.isRegistration ? styles.regInput : styles.input}
    //       style={styles.formInput}
    //       value={params.value}
    //       keyboardType={params.keyboard || 'default'}
    //       onChangeText={this.onChangeText.bind(this, params.prop)}
    //     >{label}</FloatLabel>
    //     {error}
    //   </View>
    // );
  },
  myDateTemplate(params) {
    var labelStyle = {color: '#cccccc', fontSize: 17, paddingLeft: 10, paddingBottom: 10};
    var textStyle = {color: this.state.isRegistration ? '#ffffff' : '#000000', fontSize: 17, paddingLeft: 10, paddingBottom: 10};
    var prop = params.prop
    let resource = this.state.resource
    let label, style, propLabel
    if (resource && resource[prop.name]) {
      label = resource[prop.name].title
      style = textStyle
      propLabel = <View style={{marginLeft: 10, marginTop: 5, marginBottom: 5, backgroundColor: this.state.isRegistration ? 'transparent' : '#ffffff'}}>
                    <Text style={{fontSize: 12, height: 12, color: this.state.isRegistration ? '#eeeeee' : '#B1B1B1'}}>{params.label}</Text>
                  </View>
    }
    else {
      label = params.label
      style = labelStyle
      propLabel = <View style={{paddingTop: 9}}/>
    }

    var err = this.state.missedRequiredOrErrorValue
            ? this.state.missedRequiredOrErrorValue[prop.name]
            : null
    var error = err
              ? <View style={{paddingLeft: 5, backgroundColor: 'transparent'}}>
                  <Text style={{fontSize: 14, color: this.state.isRegistration ? '#eeeeee' : '#a94442'}}>This field is required</Text>
                </View>
              : <View />

    return (
      <View style={styles.dateContainer}>
       {propLabel}
       <TouchableHighlight style={styles.button} underlayColor="transparent" onPress={this.showModal.bind(this, prop, true)}>
         <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
           <Text style={style}>{(params.value &&  moment(params.value).format('MMMM Do, YYYY')) || translate(params.prop)}</Text>
          <Icon name='ios-calendar-outline'  size={17}  color={LINK_COLOR}  style={styles.icon1} />
         </View>
       </TouchableHighlight>
       { /*this.state.modal[prop.name]*/ this.state.modal  &&  this.state.modal[prop.name]
        ? <Picker closeModal={() => {
           this.showModal(prop, false)
        }} offSet={this.state.offSet} value={params.value} prop={params.prop} changeTime={this.changeTime.bind(this, params.prop)}  />
        : (err ? error : null) }
      </View>
    );
  },
  // showModal(prop, show) {
  //   this.setState({modal: show})
  // },
  showModal(prop, show) {
    let m = {}
    extend(true, m, this.state.modal)
    if (show)
      m[prop.name] = show
    else {
      for (let p in m)
        m[p] = false
    }

    this.setState({modal: m})
  },
  changeTime: function(prop, time) {
    var r = {}
    extend(true, r, this.state.resource)
    r[prop.name] = time.getTime()
    if (!this.floatingProps)
      this.floatingProps = {}
    this.floatingProps[prop.name] = time
    this.setState({
      resource: r,
    });

   },

  // myDateTemplate (prop) {
  //   return (<NewDatePicker prop={prop}/>)
  // },

  inputFocused(refName) {
    if (!this.state.isRegistration   &&
         this.refs                   &&
         this.refs.scrollView        &&
         this.props.model            &&
         Object.keys(this.props.model.properties).length > 5) {
      utils.scrollComponentIntoView(this.refs.scrollView, this.refs.form.getComponent(refName))
    }
  },
  // scrollDown (){
  //   if (this.refs  &&  this.refs.scrollView) {
  //      this.refs.scrollView.scrollTo(Device.height * 2/3);
  //   }
  // },
  myCustomTemplate(params) {
    var labelStyle = {color: '#b1b1b1', fontSize: 18, paddingBottom: 10};
    var textStyle = {color: this.state.isRegistration ? '#ffffff' : '#000000', fontSize: 18, paddingBottom: 10};
    var resource = /*this.props.resource ||*/ this.state.resource
    var label, style
    var propLabel, propName
    var isItem = this.props.metadata != null
    var prop = this.props.model
             ? this.props.model.properties[params.prop]
             : this.props.metadata.items.properties[params.prop]
    if (resource && resource[params.prop]) {
      var m = utils.getId(resource[params.prop]).split('_')[0]
      var rModel = utils.getModel(m)
      label = utils.getDisplayName(resource[params.prop], rModel.properties)

      if (!label)
        label = resource[params.prop].title
      if (rModel.subClassOf  &&  rModel.subClassOf === ENUM)
        label = utils.createAndTranslate(label, true)
      style = textStyle
      propLabel = <View style={{marginTop: -5, marginBottom: 5, backgroundColor: this.state.isRegistration ? 'transparent' : '#ffffff'}}>
                    <Text style={{fontSize: 12, height: 12, color: this.state.isRegistration ? '#eeeeee' : '#B1B1B1'}}>{params.label}</Text>
                  </View>
    }
    else {
      label = params.label
      style = labelStyle
      propLabel = <View style={{marginTop: 13}}/>
    }
    var err = this.state.missedRequiredOrErrorValue
            ? this.state.missedRequiredOrErrorValue[prop.name]
            : null
    var error = err
              ? <View style={{backgroundColor: 'transparent'}}>
                  <Text style={{fontSize: 14, color: this.state.isRegistration ? '#eeeeee' : '#a94442'}}>{translate('thisFieldIsRequired')}</Text>
                </View>
              : <View />
    return (
      <View style={styles.chooserContainer} key={this.getNextKey()} ref={prop.name}>
        <TouchableHighlight underlayColor='transparent' onPress={this.chooser.bind(this, prop, params.prop)} >
          <View style={[{ height: 45, position: 'relative', marginLeft: 15}]}>
            {propLabel}
            <View style={[styles.chooserContentStyle, {borderColor: '#ffffff', borderBottomWidth: 0.5, borderBottomColor: '#cccccc'}]}>
              <Text style={style}>{label}</Text>
              <Text style={{color: (this.props.bankStyle  &&  this.props.bankStyle.LINK_COLOR) || '#a94442', fontSize: 14, marginRight: 5}}>{'>'}</Text>
            </View>
           {error}
          </View>
        </TouchableHighlight>
      </View>
    );
  },

  chooser(prop, propName,event) {
    var resource = this.state.resource;
    var model = (this.props.model  ||  this.props.metadata)
    if (!resource) {
      resource = {};
      resource[constants.TYPE] = model.id;
    }

    var isFinancialProduct = model.subClassOf  &&  model.subClassOf == constants.TYPES.FINANCIAL_PRODUCT
    var value = this.refs.form.input;

    var filter = event.nativeEvent.text;
    var propRef = prop.ref  ||  'tradle.Boolean'
    var m = utils.getModel(propRef);
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate(m), //m.title,
      // titleTextColor: '#7AAAC3',
      id: 10,
      component: ResourceList,
      backButtonTitle: translate('back'),
      // sceneConfig: isFinancialProduct ? Navigator.SceneConfigs.FloatFromBottom : Navigator.SceneConfigs.FloatFromRight,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        filter:         filter,
        isChooser:      true,
        prop:           prop,
        modelName:      propRef,
        resource:       resource,
        bankStyle:      this.props.bankStyle,
        currency:       this.props.currency,
        isRegistration: this.state.isRegistration,
        returnRoute:    currentRoutes[currentRoutes.length - 1],
        callback:       this.setChosenValue.bind(this),
      }
    });
  },

  // setting chosen from the list property on the resource like for ex. Organization on Contact
  setChosenValue(propName, value) {
    var resource = {}
    extend(resource, this.state.resource)
    if (typeof propName === 'object')
      propName = propName.name
    // clause for the items properies - need to redesign
    if (this.props.metadata  &&  this.props.metadata.type === 'array') {
      if (!this.floatingProps)
        this.floatingProps = {}
      this.floatingProps[propName] = value
      resource[propName] = value
    }
    else if (this.props.model.properties[propName].type === 'array')
      resource[propName] = value
    else {
      var id = value[constants.TYPE] + '_' + value[constants.ROOT_HASH]
      resource[propName] = {
        id: id,
        title: utils.getDisplayName(value, utils.getModel(value[constants.TYPE]).properties)
      }
      var data = this.refs.form.refs.input.state.value;
      if (data) {
        for (var p in data)
          if (!resource[p])
            resource[p] = data[p];
      }
    }
    this.setState({
      resource: resource,
      prop: propName
    });

    // var r = {}
    // extend(r, this.state.resource)
    // for (var p in this.floatingProps)
    //   r[p] = this.floatingProps[p]
    // Actions.saveTemporary(r)
  },

  // MONEY value and curency template
  myMoneyInputTemplate(params) {
    var label = params.label
    label += params.required ? '' : ' (optional)'
    label += (params.prop.ref  &&  params.prop.ref === constants.TYPES.MONEY)
           ?  ' (' + CURRENCY_SYMBOL + ')'
           : ''
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          {
             this.myTextInputTemplate({
                    label: label,
                    prop:  params.prop,
                    value: params.value.value ? params.value.value + '' : '',
                    required: params.required,
                    model: params.model,
                    keyboard: 'numeric',
                  })
          }
          {
             this.myEnumTemplate({
                    prop:     params.prop,
                    enumProp: utils.getModel(constants.TYPES.MONEY).properties.currency,
                    required: params.required,
                    value:    params.value.currency,
                    noError: true
                  })
        }
      </View>
    );
  },

  myEnumTemplate(params) {
    var labelStyle = {color: '#cccccc', fontSize: 17, paddingLeft: 10, paddingBottom: 10};
    var textStyle = {color: '#000000', fontSize: 17, paddingLeft: 10, paddingBottom: 10};
    var label
    var prop = params.prop
    var enumProp = params.enumProp
    var error
    if (!params.noError) {
      var err = this.state.missedRequiredOrErrorValue
              ? this.state.missedRequiredOrErrorValue[prop.name]
              : null
      error = err
                ? <View style={{paddingLeft: 5, backgroundColor: 'transparent'}}>
                    <Text style={{fontSize: 14, color: this.state.isRegistration ? '#eeeeee' : '#a94442'}}>Enter a valid {prop.title}</Text>
                  </View>
                : <View />
    }
    else
      error = <View/>
    var value = prop ? params.value : resource[enumProp.name]
    return (
      <View style={[styles.chooserContainer, {flex: 1, width: 40}]} key={this.getNextKey()} ref={enumProp.name}>
        <TouchableHighlight underlayColor='transparent' onPress={this.enumChooser.bind(this, prop, enumProp)}>
          <View style={{ position: 'relative'}}>
            <View style={[styles.chooserContentStyle, { borderColor: '#ffffff', borderBottomColor: '#cccccc', borderBottomWidth: 0.5, paddingVertical: 0}]}>
              <Text style={styles.enumText}>{value}</Text>
              <Text style={[styles.icon1, styles.enumProp, {color: (this.props.bankStyle  &&  this.props.bankStyle.LINK_COLOR) || '#a94442', fontSize: 14, marginRight: 5}]}>{'>'}</Text>
            </View>
           {error}
          </View>
        </TouchableHighlight>
      </View>
    );
  },
  enumChooser(prop, enumProp, event) {
    var resource = this.state.resource;
    var model = (this.props.model  ||  this.props.metadata)
    if (!resource) {
      resource = {};
      resource[constants.TYPE] = model.id;
    }

    var value = this.refs.form.input;

    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: enumProp.title,
      titleTextColor: '#7AAAC3',
      id: 22,
      component: EnumList,
      backButtonTitle: 'Back',
      passProps: {
        prop:        prop,
        enumProp:    enumProp,
        resource:    resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback:    this.setChosenEnumValue.bind(this),
      }
    });
  },
  setChosenEnumValue(propName, enumPropName, value) {
    var resource = {}
    extend(true, resource, this.state.resource)
    // clause for the items properies - need to redesign
    // resource[propName][enumPropName] = value
    if (resource[propName]) {
      if (typeof resource[propName] === 'object')
        resource[propName][enumPropName] = value[Object.keys(value)[0]]
      else {
        resource[propName] = {
          value: resource[propName],
          [enumPropName]: value[Object.keys(value)[0]]
        }
      }
    }
    if (!this.floatingProps)
      this.floatingProps = {}
    if (!this.floatingProps[propName])
      this.floatingProps[propName] = {}
    this.floatingProps[propName][enumPropName] = value[Object.keys(value)[0]]

    if (this.state.isPrefilled) {
      var props = (this.props.model  ||  this.props.metadata).properties
      if (props[propName].ref  &&  props[propName].ref === constants.TYPES.MONEY) {
        if (!this.floatingProps[propName].value  &&  resource[propName]  &&  resource[propName].value)
          this.floatingProps[propName].value = resource[propName].value
      }
    }

    // resource[propame] = value
    var data = this.refs.form.refs.input.state.value;
    if (data) {
      for (var p in data)
        if (!resource[p])
          resource[p] = data[p];
    }

    this.setState({
      resource: resource,
      prop: propName
    });
  },
  validateProperties(value) {
    let properties = this.props.model.properties
    let err = []
    CURRENCY_SYMBOL = this.props.currency ? this.props.currency.symbol ||  this.props.currency : DEFAULT_CURRENCY_SYMBOL
    let delProps = []
    for (var p in value) {
      if (!value[p])
        continue
      let prop = properties[p]
      if (!prop  ||  p.charAt(0) === '_')
        continue
      if (prop.type === 'number')
        this.checkNumber(value[p], prop, err)
      else if (prop.ref === constants.TYPES.MONEY) {
        if (typeof value[p] === 'number'  ||  typeof value[p] === 'string') {
          value[p] = {
            value: value[p],
            currency: CURRENCY_SYMBOL
          }
        }
        if (!value[p].value) {
          delProps.push(p)
          continue
        }
        this.checkNumber(value[p], prop, err)
        if (!value[p].currency)
          value[p].currency = this.props.currency
      }
      else if (prop.units && prop.units === '[min - max]') {
        let v = value[p].split('-').forEach((n) => trim(n))
        if (v.length === 1)
          checkNumber(v, prop, err)
        else if (v.length === 2) {
          checkNumber(v[0], prop, err)
          if (err[p])
            continue
          checkNumber(v[1], prop, err)
          if (!err[p])
            continue
          if (v[1] < v[0])
            err[p] = translate('theMinValueBiggerThenMaxValue') //'The min value for the range should be smaller then the max value'
        }
        else
          err[p] = translate('thePropertyWithMinMaxRangeError') // The property with [min-max] range can have only two numbers'
      }
      // 'pattern' can be regex pattern or property where the pattern is defined.
      // It is for country specific patterns like 'phone number'

      else if (prop.pattern) {
        if (!(new RegExp(prop.pattern).test(value[p])))
          err[prop.name] = translate('invalidProperty', prop.title)
      }
      // else if (prop.patterns) {
      //   let cprops = []
      //   for (let pr in properties) {
      //     if (properties[pr].ref && properties[pr].ref === 'tradle.Country')
      //       cprops.push(pr)
      //   }
      //   if (!cprops.length)
      //     continue

      //   let patternCountry = cprops.map((p) => {
      //     let val = value[p]  ||  this.props.resource[p]
      //     return val ? val : undefined
      //   })
      //   if (!patternCountry)
      //     continue
      //   let pattern = prop.patterns[patternCountry[0]]
      //   if (pattern  &&  !(new RegExp(pattern).test(value[p])))
      //     err[prop.name] = 'Invalid ' + prop.title
      // }
    }
    if (delProps.length)
      delProps.forEach((p) => delete value[p])
    return err
  },
  checkNumber(v, prop, err) {
    var p = prop.name
    if (prop.ref === constants.TYPES.MONEY)
      v = v.value
    if (isNaN(v))
      err[p] = 'Please enter a valid number'
    else {
      if (typeof v === 'string')
        v = parseFloat(v)
      if (prop.max && v > prop.max)
        err[p] = 'The maximum value for is ' + prop.max
      else if (prop.min && v < prop.min)
        err[p] = 'The minimum value for is ' + prop.min
    }
  },

}


var styles = StyleSheet.create({
  enumProp: {
    marginTop: 20,
    paddingBottom: 10
  },
  enumText: {
    marginTop: 20,
    marginLeft: 20,
    color: '#757575',
    fontSize: 17
  },
  icon1: {
    width: 15,
    height: 15,
    marginVertical: 2
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: -5,
    marginRight: 5,
  },
  dateContainer: {
    // height: 60,
    borderColor: '#ffffff',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 0.5,
    marginLeft: 10,
    marginBottom: 10,
    flex: 1
  },

  chooserContainer: {
    // height: 46,
    marginRight: 15,
    // marginBottom: 10,
    paddingBottom: 10,
    flex: 5
  },
  chooserContentStyle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 5,
    // borderRadius: 4
  },

  // chooserContainer: {
  //   height: 60,
  //   // borderColor: '#ffffff',
  //   // borderBottomColor: '#cccccc',
  //   // borderBottomWidth: 0.5,
  //   // borderRadius: 4,
  //   // marginLeft: 10,
  //   // marginBottom: 10,
  //   flex: 1
  // },
  // chooserContentStyle: {
  //   justifyContent: 'space-between',
  //   flexDirection: 'row',
  //   paddingVertical: 5,
  //   fontFamily: 'none',
  //   borderColor: '#ffffff',
  //   borderBottomColor: '#cccccc',
  //   borderBottomWidth: 0.5,
  //   borderRadius: 4,
  //   marginBottom: 5
  // },
  labelInput: {
    color: '#cccccc',
  },
  formInput: {
    borderBottomWidth: 0.5,
    marginLeft: 10,
    borderColor: '#cccccc',
  },
  regInput: {
    borderWidth: 0,
    color: '#eeeeee'
  },
  input: {
    borderWidth: 0,
  },
  buttonText: {
   textAlign: 'center'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  }
})
module.exports = NewResourceMixin;

