var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent() {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("@/lib/db");
var schema_1 = require("@/lib/db/schema");
/**
 * Seed default timeline categories
 * Run with: pnpm tsx src/lib/db/seed/timeline-categories.ts
 */
function seedTimelineCategories() {
  return __awaiter(this, void 0, void 0, function () {
    var categories, _i, categories_1, category;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          console.log("Seeding timeline categories...");
          categories = [
            {
              key: "education",
              name: "Education",
              description: "Schools, universities, degrees, certifications",
              icon: "graduation-cap",
              color: "#3b82f6",
              sortOrder: 0,
            },
            {
              key: "work",
              name: "Career",
              description: "Jobs, promotions, professional achievements",
              icon: "briefcase",
              color: "#10b981",
              sortOrder: 1,
            },
            {
              key: "family",
              name: "Family",
              description: "Children, marriage, family milestones",
              icon: "users",
              color: "#8b5cf6",
              sortOrder: 2,
            },
            {
              key: "accomplishments",
              name: "Accomplishments",
              description: "Awards, achievements, recognition, milestones",
              icon: "trophy",
              color: "#f59e0b",
              sortOrder: 3,
            },
            {
              key: "travel",
              name: "Travel",
              description: "Adventures, trips, explorations",
              icon: "plane",
              color: "#06b6d4",
              sortOrder: 4,
            },
            {
              key: "personal",
              name: "Personal",
              description: "Health, hobbies, personal growth",
              icon: "heart",
              color: "#ec4899",
              sortOrder: 5,
            },
            {
              key: "faith",
              name: "Faith",
              description: "Religious events, spiritual milestones",
              icon: "sparkles",
              color: "#a855f7",
              sortOrder: 6,
            },
            {
              key: "military",
              name: "Military Service",
              description: "Service, deployments, honors",
              icon: "shield",
              color: "#22c55e",
              sortOrder: 7,
            },
            {
              key: "pets",
              name: "Pets",
              description: "Beloved animal companions",
              icon: "paw-print",
              color: "#f97316",
              sortOrder: 8,
            },
          ];
          (_i = 0), (categories_1 = categories);
          _a.label = 1;
        case 1:
          if (!(_i < categories_1.length)) return [3 /*break*/, 4];
          category = categories_1[_i];
          return [
            4 /*yield*/,
            db_1.db
              .insert(schema_1.timelineCategories)
              .values(category)
              .onConflictDoUpdate({
                target: schema_1.timelineCategories.key,
                set: {
                  name: category.name,
                  description: category.description,
                  icon: category.icon,
                  color: category.color,
                  sortOrder: category.sortOrder,
                },
              }),
          ];
        case 2:
          _a.sent();
          _a.label = 3;
        case 3:
          _i++;
          return [3 /*break*/, 1];
        case 4:
          console.log(
            "Seeded ".concat(categories.length, " timeline categories")
          );
          return [2 /*return*/];
      }
    });
  });
}
// Run if executed directly
seedTimelineCategories()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding categories:", err);
    process.exit(1);
  });
