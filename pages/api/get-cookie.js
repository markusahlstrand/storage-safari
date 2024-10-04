export default function handler(req, res) {
  const httpOnlyCookie = req.cookies.httpOnlyTestTimestamp || null;
  res.status(200).json({ httpOnlyCookie });
}