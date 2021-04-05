import { MongoClient } from "https://deno.land/x/mongo@v0.22.0/mod.ts";
import { Quote } from "../types.ts";


// Mongo Connection Init
const client = new MongoClient();
try {
  await client.connect("mongodb://127.0.0.1:27017");
  console.log("Database successfully connected")
} catch(err) {
  console.log(err)
}


const db = client.database("quotesApp");
const quotes = db.collection<Quote>("quotes");

// @description: ADD single quote
// @route POST /api/quote
const addQuote = async ({ request, response }: {request: any, response: any}) => {
  try {
    if (!request.hasBody) {
      response.status = 400
      response.body = {
          success: false,
          msg: 'No Data'
      } 
    } else {
        const body = await request.body();
        const quote = await body.value;
        await quotes.insertOne(quote)
        response.status = 201
        response.body = {
          success: true,
          data: quote
        }
      }
      } catch (err) {
        response.body = {
          success: false,
          msg: err.toString()
        }
      }
  } 

// @description: GET all Quotes
// @route GET /api/quote
const getQuotes = async({ response }: { response: any }) => {

  try {
    const allQuotes = await quotes.find({}).toArray();
    console.log(allQuotes)
    if(allQuotes) {
      response.status = 200
      response.body = {
        success: true,
        data: allQuotes,
      };
    } else {
      response.status = 500
      response.body = {
        success: false,
        msg: "Internal Server Error"
      }
    }
  } catch (err) {
    response.body = {
      success: false,
      msg: err.toString()
    }
  }

  
};

// @description: GET single quote
// @route GET /api/quote/:id
const getQuote = async ({
  params,
  response,
}: {
  params: { id: string },
  response: any,
}) => {
  
const quote = await quotes.findOne({ quoteID: params.id });

  if (quote) {
    response.status = 200;
    response.body = {
      success: true,
      data: quote,
    };
  } else {
    response.status = 404;
    response.body = {
      success: false,
      msg: "No quote found",
    };
  }
};

// @description: UPDATE single quote
// @route PUT /api/quote/:id
const updateQuote = async ({
  params,
  request,
  response,
}: {
  params: { id: string },
  request: any,
  response: any,
}) => {
  
  try {
    const body = await request.body();
    const inputQuote = await body.value;
    await quotes.updateOne(
      { quoteID: params.id },
      { $set: { quote: inputQuote.quote, author: inputQuote.author } },
    );
    const updatedQuote = await quotes.findOne({ quoteID: params.id })
    response.status = 200;
    response.body = {
      success: true,
      data: updatedQuote,
    };
  } catch (err) {
    response.body = {
      success: false,
      msg: err.toString()
    }
  }
};


// @description: DELETE single quote
// @route DELETE /api/quote
const deleteQuote = async ({
  params,
  response,
}: {
  params: { id: string },
  request: any,
  response: any,
}) => {
  try {
    await quotes.deleteOne({ quoteID: params.id });
    response.status = 201;
    response.body = {
      success: true,
      msg: "Product deleted",
    };
  } catch (err) {
    response.body = {
      success: false,
      msg: err.toString()
    }
  }
};

export { addQuote, getQuotes, getQuote, updateQuote, deleteQuote };
