var Task = require("../models/task.model");
var JWT = require("../common/_JWT");
const Helper = require("../helpers/helper");
const moment = require("moment-timezone");
const OrderIndex = require("../models/orderIndex.model");
const jsonPropNameList = ["checkList"];

exports.getList = async function (req, res) {
  Helper.handleRequest(req, res, async (userId) => {
    let tasks = await Task.getAll(userId, req.query);
    if (tasks) {
      Helper.handleRequest(req, res, async (userId) => {
        const orderIndexes = await OrderIndex.getAll(userId);
        if (orderIndexes) {
          openTaskOrder = JSON.parse(
            orderIndexes.find((x) => x.type === "open-task").orderList
          );
          inProgressTaskOrder = JSON.parse(
            orderIndexes.find((x) => x.type === "in-progress-task").orderList
          );
          doneTaskOrder = JSON.parse(
            orderIndexes.find((x) => x.type === "done-task").orderList
          );
          allTaskOrder = [
            ...openTaskOrder,
            ...inProgressTaskOrder,
            ...doneTaskOrder,
          ];
          tasks = tasks.sort((a, b) => {
            const indexA = allTaskOrder.indexOf(a.id);
            const indexB = allTaskOrder.indexOf(b.id);
            return indexA - indexB;
          });
        }
        formatRecordsBeforeSend(tasks);
        res.send({ result: tasks });
      });
    } else {
      res.status(404).send({ error: "Task not found" });
    }
  });
};

exports.getListUncompleted = async function (req, res) {
  Helper.handleRequest(req, res, async (userId) => {
    let tasks = await Task.getAllUncompleted(userId, req.query);
    if (tasks) {
      formatRecordsBeforeSend(tasks);
    }
    res.send({ result: tasks });
  });
};

exports.getById = async function (req, res) {
  Helper.handleRequest(req, res, async (userId) => {
    const task = await Task.getById(userId, req.params.id);
    if (task) {
      Helper.parseJsonProperty(task, jsonPropNameList);
      Helper.changeRecordsDateTimePropertyToUTC(
        task,
        "startDate",
        "finishDate",
        "createdAt"
      );
    }
    res.send({ result: task });
  });
};

exports.add = async function (req, res) {
  Helper.handleRequest(req, res, async (userId) => {
    let data = req.body;
    data.createdBy = userId;
    Helper.stringifyJsonProperty(data, jsonPropNameList);
    if (data.startDate)
      data.startDate = Helper.getFormattedMySqlDateTime(data.startDate);

    if (data.finishDate)
      data.finishDate = Helper.getFormattedMySqlDateTime(data.finishDate);
    const task = await Task.create(data);
    Helper.changeRecordDateTimePropertyToUTC(
      task,
      "startDate",
      "finishDate",
      "createdAt"
    );
    if (task.checkList) task.checkList = JSON.parse(task.checkList);
    res.send({ result: task });
  });
};

exports.update = async function (req, res) {
  const recordId = req.params.id;
  Helper.handleRequest(req, res, async (userId) => {
    let data = req.body;
    Helper.stringifyJsonProperty(data, jsonPropNameList);
    Helper.formatTimeValue(data, "startDate", "finishDate");
    await taskBeforeUpdateInterceptor(data, userId, recordId);
    const updateResult = await Task.update(req.params.id, data);
    if (updateResult.affectedRows > 0) {
      const task = await Task.getById(userId, req.params.id);
      if (task) Helper.parseJsonProperty(task, jsonPropNameList);
      Helper.changeRecordDateTimePropertyToUTC(
        task,
        "startDate",
        "finishDate",
        "createdAt"
      );
      res.send({ result: task });
    } else {
      res.status(404).send({ error: "Task not found" });
    }
  });
};

exports.updateLittle = async function (req, res) {
  const recordId = req.params.id;
  Helper.handleRequest(req, res, async (userId) => {
    var data = req.body;
    if (data) {
      Helper.stringifyJsonProperty(data, jsonPropNameList);
    }
    Helper.formatTimeValue(data, "startDate", "finishDate");
    await taskBeforeUpdateInterceptor(data, userId, recordId);
    console.log(data.finishDate);
    const updateResult = await Task.update(req.params.id, data);
    if (updateResult.affectedRows > 0) {
      const task = await Task.getById(userId, req.params.id);
      if (task) Helper.parseJsonProperty(task, jsonPropNameList);
      res.send({ result: task });
    } else {
      res.status(404).send({ error: "Task not found" });
    }
  });
};

exports.updateLittleMany = async function (req, res) {
  Helper.handleRequest(req, res, async (userId) => {
    var data = req.body;
    if (data) {
      Helper.stringifyJsonProperty(data, jsonPropNameList);
    }
    Helper.formatTimeValue(data, "startDate", "finishDate");
    const listIds = data.listIds;
    delete data.listIds;
    const updateResult = await Task.updateLittleMany(listIds, data);
    res.send({ result: updateResult });
  });
};

exports.remove = function (req, res) {
  Helper.handleRequest(req, res, async (userId) => {
    const task = await Task.getById(userId, req.params.id);
    const removeResult = await Task.remove(req.params.id);
    if (removeResult.affectedRows > 0) {
      if (task.checkList) task.checkList = JSON.parse(task.checkList);
      res.send({ result: task });
    }
  });
};

async function taskBeforeUpdateInterceptor(data, userId, recordId) {
  const response = await Task.getById(userId, recordId);
  const oldData = response[0];
  if (oldData.status != 2 && data.status == 2 && !oldData.finishDate) {
    let endOfToday = new Date();
    endOfToday.setHours(23, 59, 59);
    data.finishDate = Helper.getFormattedMySqlDateTime(endOfToday);
    console.log(data.finishDate);
  }
}

function taskAfterUpdateInterceptor(oldData, newData, userId) {
  if (oldData.projectId != newData.projectId) {
    let oldProjectTaskCount = Task.getTaskCountByProjectId(
      userId,
      oldData.projectId
    );
  }
}

function formatRecordsBeforeSend(records) {
  Helper.parseRecordsJsonProperty(records, "checkList");
  Helper.changeRecordsDateTimePropertyToUTC(
    records,
    "startDate",
    "finishDate",
    "createdAt"
  );
}
